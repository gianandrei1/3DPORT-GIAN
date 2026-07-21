const fs = require('fs');
const https = require('https');
const TextToSVG = require('text-to-svg');

const fontUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTagalog/NotoSansTagalog-Regular.ttf';
const fontPath = './NotoSansTagalog.ttf';

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      download(response.headers.location, dest, cb);
    } else {
      response.pipe(file);
      file.on('finish', () => {
        file.close(cb);
      });
    }
  });
};

download(fontUrl, fontPath, () => {
  TextToSVG.load(fontPath, (err, textToSVG) => {
    if (err) {
      console.error(err);
      return;
    }
    const attributes = { fill: 'white' };
    const options = { x: 0, y: 0, fontSize: 100, anchor: 'top', attributes: attributes };
    const svg = textToSVG.getSVG('ᜄᜒᜌᜈ᜕ ᜀᜈ᜕ᜇ᜕ᜍᜒᜁ', options);
    fs.writeFileSync('./src/assets/baybayin.svg', svg);
    console.log('SVG generated successfully!');
  });
});
