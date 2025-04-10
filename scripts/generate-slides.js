import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the directory if it doesn't exist
const slideDir = path.join(__dirname, '../public/images/slides');
if (!fs.existsSync(slideDir)) {
  fs.mkdirSync(slideDir, { recursive: true });
}

// Banner dimensions
const width = 1200;
const height = 400;

// Banner colors
const bannerColors = [
  { background: '#4361EE', text: 'Summer Sale', subtext: 'Up to 50% off on selected items' },
  { background: '#3A0CA3', text: 'New Arrivals', subtext: 'Discover our latest collection' },
  { background: '#F72585', text: 'Special Offer', subtext: 'Free shipping on orders over $50' }
];

// Generate each banner
bannerColors.forEach((banner, index) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = banner.background;
  ctx.fillRect(0, 0, width, height);

  // Add pattern for texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < width; i += 30) {
    for (let j = 0; j < height; j += 30) {
      ctx.beginPath();
      ctx.arc(i, j, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw horizontal lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Draw main text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(banner.text, width / 2, height / 2 - 30);

  // Draw subtext
  ctx.font = '36px Arial';
  ctx.fillText(banner.subtext, width / 2, height / 2 + 40);

  // Draw button
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = (width - buttonWidth) / 2;
  const buttonY = height / 2 + 100;

  ctx.fillStyle = 'white';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  
  ctx.fillStyle = banner.background;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Shop Now', width / 2, buttonY + buttonHeight / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(slideDir, `slide${index + 1}.jpg`), buffer);
  
  console.log(`Generated slide${index + 1}.jpg`);
});

console.log('All slides generated successfully!'); 