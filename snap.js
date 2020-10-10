let activeTab;

async function updateActiveTab(tabs) {
  activeTab = await browser.tabs.query({active: true, currentWindow: true});
  console.log(activeTab&&activeTab[0].id);

  await findVideo();
}

function findVideo() {
  return browser.tabs.sendMessage(activeTab[0].id, {
    command: "detect"
  }).catch(e => receiveMessages({}));
}

function takeSnapshot() {
  return browser.tabs.sendMessage(activeTab[0].id, {
    command: "snap"
  }).catch(e => console.log(e));
}

function blobDataUrl(blob) {
  let f = new FileReader();
  return new Promise(resolve => {
    f.onload = (e) => resolve(e.target.result);
    f.readAsDataURL(blob);
  });
}

async function receiveMessages(message) {
  if (message.error) {
    return console.log(new Error('Snapshot error: '+message.error));
  }

  let V = message.video;

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/setIcon
  if (V) {
    let settingIcon = browser.browserAction.setIcon(
      { path: { 16: 'img/snap16.png', 32: 'img/snap21.png' } }
    );
  } else {
    let settingIcon = browser.browserAction.setIcon(
      { path: { 16: 'img/no-snap16.png', 32: 'img/no-snap21.png' } }
    );
  }

  let { snapshot } = message;
  if (!snapshot) return;

  // TODO: copy to clipboard
  console.log(snapshot.blob);

  let imagebuf = await snapshot.blob.arrayBuffer();
  await browser.clipboard.setImageData(imagebuf, 'png')


  // Open snapshot in new tab
  let imagedu = await blobDataUrl(snapshot.blob);
  //console.log(imagedu);

  let newtab = await browser.tabs.create({
    url: '/snapshot.html'
  });

  browser.tabs.executeScript({
    code: `document.body.innerHTML='<img src="${imagedu}" style="max-width: 100%" />'`
  });
}



browser.browserAction.onClicked.addListener(takeSnapshot);

browser.runtime.onMessage.addListener(receiveMessages);


//setInterval( findVideo, 500 );
//TODO: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();



//icons by Boyan Vasilev https://www.iconfinder.com/iconsets/interface-3-4