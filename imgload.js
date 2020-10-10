const fs=require('fs');

let png = fs.readFileSync('./mini.png');

console.log(JSON.stringify(png.toJSON().data))

