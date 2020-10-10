  
(function() {
  if (window.__snappy) {
    return;
  }
  window.__snappy = true;

  browser.runtime.onMessage.addListener(async (message) => {
    let V=document.querySelectorAll('video')[0];

    if (message.command === "snap") {
      if (!V) {
        return browser.runtime.sendMessage({
          error: 'novideo'
        });
      }

      let C=document.createElement('canvas');
      C.width=V.videoWidth;
      C.height=V.videoHeight;
      C.getContext('2d').drawImage(V,0,0);

      let Cblob = await new Promise( resolve => C.toBlob(resolve) );

      return browser.runtime.sendMessage({
        video: true,
        
        snapshot: {
          //dataurl: C.toDataURL(),
          blob: Cblob,
        }
      });
    }

    return browser.runtime.sendMessage({
      video: !!V,
    });

  });

})();