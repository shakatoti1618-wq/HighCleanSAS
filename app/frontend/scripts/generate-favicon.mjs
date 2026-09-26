import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const INPUT_LOGO = path.resolve('public/logo-transparente.png');
const OUTPUT_DIR = path.resolve('public');

async function generateFavicons() {
  if (!fs.existsSync(INPUT_LOGO)) {
    console.error(`❌ Logo source not found: ${INPUT_LOGO}`);
    process.exit(1);
  }

  console.log('🔄 Generating favicons from company logo...');

  const logoBuffer = await fs.promises.readFile(INPUT_LOGO);
  
  // Load with sharp, trim transparent/white borders
  const trimmed = await sharp(logoBuffer)
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(`   Trimmed logo: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // Create square canvas (256x256 transparent) and center the resized trimmed logo
  const SQUARE_SIZE = 256;
  const resizedForSquare = await sharp(trimmed)
    .resize(SQUARE_SIZE, SQUARE_SIZE, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const square = await sharp({
    create: {
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: resizedForSquare,
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  // Generate required PNG sizes from the square
  const sizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  const pngPaths = [];
  for (const { name, size } of sizes) {
    const outPath = path.join(OUTPUT_DIR, name);
    await sharp(square)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    pngPaths.push(outPath);
    console.log(`   ✅ ${name} (${size}x${size})`);
  }

  // Generate favicon.ico from 16, 32, 48 PNGs
  const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');
  const icoBuffer = await pngToIco([pngPaths[0], pngPaths[1], pngPaths[2]]);
  await fs.promises.writeFile(icoPath, icoBuffer);
  console.log(`   ✅ favicon.ico (contains 16x16, 32x32, 48x48)`);
  console.log(`   favicon.ico size: ${icoBuffer.length} bytes`);

  console.log('🎉 Favicon generation complete!');
}

generateFavicons().catch(err => {
  console.error('❌ Favicon generation failed:', err);
  process.exit(1);
});