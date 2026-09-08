const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const png2icons = require('png2icons');

// Helper to calculate CRC32 for PNG chunks
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createLuxuryIconPNG(size = 256) {
  // Create RGBA image
  const rawData = Buffer.alloc((size * 4 + 1) * size);

  // Palette:
  // Ink: #1E2A32 (30, 42, 50)
  // Brass: #B08D45 (176, 141, 69)
  // Brass-Light: #D4AF37 (212, 175, 55)
  // Live Green: #3E7C59 (62, 124, 89)
  // White/Paper: #FCFAF8 (252, 250, 248)

  const radius = size * 0.22; // rounded squircle corners
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (size * 4 + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Squircle distance check
      const dx = Math.max(Math.abs(x - center) - (center - radius), 0);
      const dy = Math.max(Math.abs(y - center) - (center - radius), 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Transparent outside rounded corner
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Base background: #1E2A32 (Ink)
      let r = 30, g = 42, b = 50, a = 255;

      // Subtle border highlight (Brass: #B08D45)
      if (dist > radius - 6) {
        r = 176; g = 141; b = 69;
      }

      // Drawing Neoclassical Pediment / Estate Monogram:
      // Triangle Roof / Pediment (y: 50 to 95)
      const roofPeakY = size * 0.22;
      const roofBaseY = size * 0.38;
      const roofHalfW = size * 0.32;

      if (y >= roofPeakY && y <= roofBaseY) {
        const progress = (y - roofPeakY) / (roofBaseY - roofPeakY);
        const currentHalfW = progress * roofHalfW;
        if (Math.abs(x - center) <= currentHalfW) {
          // Inside roof triangle
          if (y >= roofBaseY - 6 || Math.abs(Math.abs(x - center) - currentHalfW) < 5) {
            // Gold border
            r = 212; g = 175; b = 55;
          } else {
            r = 176; g = 141; b = 69;
          }
        }
      }

      // Architrave beam (y: 96 to 108)
      if (y >= size * 0.38 && y <= size * 0.43 && Math.abs(x - center) <= roofHalfW) {
        r = 212; g = 175; b = 55;
      }

      // 4 Architectural Columns (y: 108 to 175)
      if (y >= size * 0.43 && y <= size * 0.68) {
        const colW = size * 0.05;
        const colPositions = [
          center - roofHalfW * 0.8,
          center - roofHalfW * 0.26,
          center + roofHalfW * 0.26,
          center + roofHalfW * 0.8,
        ];

        for (const colX of colPositions) {
          if (Math.abs(x - colX) <= colW) {
            r = 176; g = 141; b = 69;
            if (Math.abs(x - colX) <= colW * 0.4) {
              r = 212; g = 175; b = 55; // Highlight
            }
          }
        }
      }

      // Base Pedestal (y: 175 to 192)
      if (y >= size * 0.68 && y <= size * 0.74 && Math.abs(x - center) <= roofHalfW * 0.9) {
        r = 212; g = 175; b = 55;
      }

      // Center live beacon dot (y: 140, x: center) - Live Green #3E7C59
      const dotDist = Math.sqrt((x - center) ** 2 + (y - (size * 0.55)) ** 2);
      if (dotDist <= size * 0.05) {
        r = 62; g = 124; b = 89; a = 255;
        if (dotDist <= size * 0.02) {
          r = 252; g = 250; b = 248; // White core
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8);       // bit depth
  ihdrData.writeUInt8(6, 9);       // color type (RGBA)
  ihdrData.writeUInt8(0, 10);      // compression
  ihdrData.writeUInt8(0, 11);      // filter
  ihdrData.writeUInt8(0, 12);      // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

async function main() {
  const resDir = path.join(__dirname, '..', 'resources');
  if (!fs.existsSync(resDir)) {
    fs.mkdirSync(resDir, { recursive: true });
  }

  console.log('Generating luxury estate icon PNG (256x256)...');
  const pngBuffer = createLuxuryIconPNG(256);
  const pngPath = path.join(resDir, 'icon.png');
  fs.writeFileSync(pngPath, pngBuffer);
  console.log('Saved:', pngPath);

  console.log('Converting to multi-resolution Windows icon (icon.ico)...');
  const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BILINEAR, 0, false, true);
  if (icoBuffer) {
    const icoPath = path.join(resDir, 'icon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('Saved:', icoPath);
  } else {
    console.warn('Could not generate .ico with png2icons, fallback copy.');
    fs.copyFileSync(pngPath, path.join(resDir, 'icon.ico'));
  }

  console.log('Icons generated successfully!');
}

main().catch(console.error);
