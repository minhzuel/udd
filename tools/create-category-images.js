import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory if it doesn't exist
const imageDir = path.join(__dirname, '../public/images/categories');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Categories to generate images for
const categories = [
  'electronics',
  'clothing',
  'books',
  'home-kitchen',
  'toys',
  'beauty',
  'sports',
  'automotive',
  'jewelry',
  'groceries',
  'health',
  'garden',
  'pets',
  'office',
  'default'
];

// Category display names (for rendering on the image)
const displayNames = {
  'electronics': 'Electronics',
  'clothing': 'Clothing',
  'books': 'Books',
  'home-kitchen': 'Home & Kitchen',
  'toys': 'Toys',
  'beauty': 'Beauty',
  'sports': 'Sports',
  'automotive': 'Automotive',
  'jewelry': 'Jewelry',
  'groceries': 'Groceries',
  'health': 'Health',
  'garden': 'Garden',
  'pets': 'Pets',
  'office': 'Office',
  'default': 'Category'
};

// Category colors
const colors = {
  'electronics': '#4361ee',
  'clothing': '#3a0ca3',
  'books': '#7209b7',
  'home-kitchen': '#f72585',
  'toys': '#4cc9f0',
  'beauty': '#f77f00',
  'sports': '#38b000',
  'automotive': '#d90429',
  'jewelry': '#ff9f1c',
  'groceries': '#2b9348',
  'health': '#6a994e',
  'garden': '#386641',
  'pets': '#bc6c25',
  'office': '#0077b6',
  'default': '#333333'
};

// Create an image for each category
categories.forEach(category => {
  // Create canvas
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background color
  ctx.fillStyle = colors[category] || colors.default;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayNames[category], width / 2, height / 2);
  
  // Add a pattern
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 120 + i * 30, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  // Save to file
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  const filePath = path.join(imageDir, `${category}.jpg`);
  fs.writeFileSync(filePath, buffer);
  
  console.log(`Created image for ${category}: ${filePath}`);
});

console.log('All category images created!'); 