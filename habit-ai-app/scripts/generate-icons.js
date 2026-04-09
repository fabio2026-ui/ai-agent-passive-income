// 简单的图标生成脚本
// 运行: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

// 确保icons目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成简单的SVG图标
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="70" font-size="50" text-anchor="middle" fill="white" font-family="Arial">✓</text>
</svg>
`;

sizes.forEach(size => {
  const svg = svgTemplate(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Generated icon-${size}x${size}.svg`);
});

// 生成简单的checkin图标
const checkinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="70" font-size="50" text-anchor="middle" fill="white">✓</text>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, 'checkin.svg'), checkinSvg);
console.log('Generated checkin.svg');

console.log('\n✅ Icons generated successfully!');
console.log('Note: For production, convert these SVGs to PNGs');
