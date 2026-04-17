// Icon Generator Script for AI Text Detector Extension
// Run: node create-icons.js
// Requires: npm install canvas (or open generate-icons.html in browser instead)

const fs = require('fs');
const path = require('path');

// Check if canvas module is available
try {
  const { createCanvas } = require('canvas');
  generateIcons(createCanvas);
} catch (e) {
  console.log('============================================');
  console.log('  Canvas module not found!');
  console.log('============================================');
  console.log('');
  console.log('You have TWO options to generate icons:');
  console.log('');
  console.log('Option 1 (Easy - Recommended):');
  console.log('  1. Open "generate-icons.html" in your browser');
  console.log('  2. Click "Download All Icons"');
  console.log('  3. Move the downloaded files to the icons/ folder');
  console.log('');
  console.log('Option 2 (Node.js):');
  console.log('  1. Run: npm install canvas');
  console.log('  2. Run: node create-icons.js');
  console.log('');

  // Create simple fallback PNG icons using raw PNG generation
  // This creates minimal valid PNG files without any dependencies
  createFallbackIcons();
}

function createFallbackIcons() {
  // Generate minimal 1-pixel colored PNG files as placeholders
  // These are valid PNGs that Chrome will accept
  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const pngData = createMinimalPNG(size);
    const iconPath = path.join(__dirname, 'icons', `icon${size}.png`);
    
    // Ensure icons directory exists
    const iconsDir = path.join(__dirname, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    fs.writeFileSync(iconPath, pngData);
    console.log(`Created placeholder icon: ${iconPath}`);
  });
  
  console.log('');
  console.log('Placeholder icons created! Extension will work but icons will be basic.');
  console.log('For better icons, open generate-icons.html in your browser.');
}

function createMinimalPNG(size) {
  // Create a proper PNG file with a purple gradient-like solid color
  // This is a valid PNG that browsers will display
  
  // PNG structure: Signature + IHDR + IDAT + IEND
  const width = size;
  const height = size;
  
  // Raw pixel data (RGBA)
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    rawData[rowStart] = 0; // Filter: None
    
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      // Purple gradient: from #7c3aed to #3b82f6
      const t = (x + y) / (width + height);
      const r = Math.round(124 + (59 - 124) * t);
      const g = Math.round(58 + (130 - 58) * t);
      const b = Math.round(237 + (246 - 237) * t);
      
      // Apply rounded corner mask
      const cx = x - width / 2;
      const cy = y - height / 2;
      const cornerR = width * 0.2;
      let alpha = 255;
      
      // Simple rounded corners
      const dx = Math.abs(cx) - (width / 2 - cornerR);
      const dy = Math.abs(cy) - (height / 2 - cornerR);
      if (dx > 0 && dy > 0) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > cornerR) alpha = 0;
        else if (dist > cornerR - 1) alpha = Math.round(255 * (cornerR - dist));
      }
      
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = alpha;
    }
  }
  
  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  
  // Build PNG file
  const chunks = [];
  
  // PNG Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createChunk('IHDR', ihdr));
  
  // IDAT chunk
  chunks.push(createChunk('IDAT', compressed));
  
  // IEND chunk
  chunks.push(createChunk('IEND', Buffer.alloc(0)));
  
  return Buffer.concat(chunks);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xEDB88320;
      else crc = crc >>> 1;
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function generateIcons(createCanvas) {
  const sizes = [128, 48, 16];
  
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0, '#7c3aed');
    bgGrad.addColorStop(1, '#3b82f6');
    
    // Rounded rectangle
    const r = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = bgGrad;
    ctx.fill();
    
    // "AI" text
    const fontSize = Math.max(6, Math.round(size * 0.38));
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', size / 2, size / 2);
    
    // Save
    const iconPath = path.join(__dirname, 'icons', `icon${size}.png`);
    const iconsDir = path.join(__dirname, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(iconPath, buffer);
    console.log(`Created icon: ${iconPath}`);
  });
  
  console.log('All icons generated successfully!');
}
