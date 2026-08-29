import fs from 'fs';
import zlib from 'zlib';

function generatePNG(width, height) {
  // CRC32 calculation helper
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, checksum]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image pixels: Coffee Dark Amber background (#120d0a => 18, 13, 10)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Draw amber border around edges
      const isBorder = x < 10 || x >= width - 10 || y < 10 || y >= height - 10;
      if (isBorder) {
        rawData[pixelOffset] = 0xd9;     // R
        rawData[pixelOffset + 1] = 0x77; // G
        rawData[pixelOffset + 2] = 0x06; // B
      } else {
        rawData[pixelOffset] = 0x12;     // R
        rawData[pixelOffset + 1] = 0x0d; // G
        rawData[pixelOffset + 2] = 0x0a; // B
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const icon192 = generatePNG(192, 192);
const icon512 = generatePNG(512, 512);

fs.writeFileSync('d:/Velvet Brews/client/public/icon-192.png', icon192);
fs.writeFileSync('d:/Velvet Brews/client/public/icon-512.png', icon512);
fs.writeFileSync('d:/Velvet Brews/mobile/public/icon-192.png', icon192);
fs.writeFileSync('d:/Velvet Brews/mobile/public/icon-512.png', icon512);

console.log("PNG icons generated successfully!");
