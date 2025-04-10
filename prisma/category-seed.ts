import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

const categories = [
  { name: 'Smartphones', description: 'Latest mobile phones and accessories' },
  { name: 'Laptops', description: 'Portable computers and accessories' },
  { name: 'Tablets', description: 'Tablet devices and accessories' },
  { name: 'Smartwatches', description: 'Wearable smart devices' },
  { name: 'Headphones', description: 'Audio devices and accessories' },
  { name: 'Cameras', description: 'Digital cameras and accessories' },
  { name: 'Gaming Consoles', description: 'Video game systems and accessories' },
  { name: 'Smart Home', description: 'Home automation and IoT devices' },
  { name: 'Drones', description: 'Unmanned aerial vehicles and accessories' },
  { name: 'VR Headsets', description: 'Virtual reality devices and accessories' },
  { name: 'Audio Systems', description: 'Home and portable audio equipment' },
  { name: 'Monitors', description: 'Computer displays and screens' },
  { name: 'Printers', description: 'Printing devices and accessories' },
  { name: 'Storage Devices', description: 'External storage solutions' },
  { name: 'Network Devices', description: 'Networking equipment and accessories' },
  { name: 'Power Banks', description: 'Portable power solutions' },
  { name: 'Smart TVs', description: 'Connected television sets' },
  { name: 'Projectors', description: 'Display projection devices' },
  { name: 'E-readers', description: 'Digital reading devices' },
  { name: 'Fitness Trackers', description: 'Health monitoring devices' },
  { name: 'Smart Speakers', description: 'Voice-controlled audio devices' },
  { name: 'Security Cameras', description: 'Surveillance and monitoring devices' },
  { name: 'Wireless Chargers', description: 'Wireless charging solutions' },
  { name: 'Bluetooth Devices', description: 'Wireless connectivity devices' },
  { name: 'Smart Locks', description: 'Digital door locking systems' },
  { name: 'Robot Vacuums', description: 'Automated cleaning devices' },
  { name: 'Smart Thermostats', description: 'Climate control devices' },
  { name: 'Smart Doorbells', description: 'Connected doorbell systems' },
  { name: 'Smart Plugs', description: 'Connected power outlets' },
  { name: 'Smart Bulbs', description: 'Connected lighting solutions' }
];

async function seedCategories() {
  console.log('Starting to seed categories...');
  
  for (const category of categories) {
    const slug = slugify(category.name);
    const imageUrl = '/categories/category.png';
    
    try {
      await prisma.category.upsert({
        where: { slug },
        update: {
          name: category.name,
          imageUrl,
          metaTitle: `${category.name} - Best Deals and Reviews`,
          metaDescription: category.description
        },
        create: {
          name: category.name,
          slug,
          imageUrl,
          metaTitle: `${category.name} - Best Deals and Reviews`,
          metaDescription: category.description
        }
      });
      console.log(`Created/Updated category: ${category.name}`);
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error);
    }
  }

  console.log('Finished seeding categories');
}

seedCategories()
  .catch((error) => {
    console.error('Error seeding categories:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 