import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const variations = {
  'Clothing Size': [
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    '4XL',
    '5XL'
  ],
  'Item Size': [
    'Mini',
    'Small',
    'Medium',
    'Large',
    'Extra Large',
    'Compact',
    'Standard',
    'Oversized'
  ],
  'Color': [
    'Black',
    'White',
    'Silver',
    'Gray',
    'Gold',
    'Rose Gold',
    'Blue',
    'Navy',
    'Red',
    'Green',
    'Yellow',
    'Purple',
    'Pink',
    'Brown',
    'Orange',
    'Metallic',
    'Space Gray',
    'Midnight Black'
  ],
  'RAM Size': [
    '2GB',
    '4GB',
    '8GB',
    '12GB',
    '16GB',
    '32GB',
    '64GB',
    '128GB'
  ],
  'Storage Capacity': [
    '16GB',
    '32GB',
    '64GB',
    '128GB',
    '256GB',
    '512GB',
    '1TB',
    '2TB',
    '4TB',
    '8TB'
  ],
  'Screen Size': [
    '5"',
    '5.5"',
    '6"',
    '6.5"',
    '7"',
    '8"',
    '10"',
    '11"',
    '13"',
    '14"',
    '15.6"',
    '17"',
    '21"',
    '24"',
    '27"',
    '32"',
    '43"',
    '49"',
    '55"',
    '65"',
    '75"',
    '85"'
  ],
  'Resolution': [
    'HD (720p)',
    'Full HD (1080p)',
    '2K (1440p)',
    '4K (2160p)',
    '8K',
    'WQHD',
    'UHD'
  ],
  'Connectivity': [
    'Wi-Fi',
    'Bluetooth',
    'Wi-Fi + Cellular',
    '4G LTE',
    '5G',
    'Ethernet',
    'USB-C',
    'Lightning'
  ],
  'Power Rating': [
    '5W',
    '10W',
    '15W',
    '20W',
    '25W',
    '30W',
    '45W',
    '60W',
    '65W',
    '100W'
  ],
  'Material': [
    'Plastic',
    'Aluminum',
    'Glass',
    'Stainless Steel',
    'Carbon Fiber',
    'Titanium',
    'Ceramic',
    'Wood',
    'Leather',
    'Fabric'
  ]
};

async function seedVariations() {
  console.log('Starting to seed variations...');
  
  for (const [name, values] of Object.entries(variations)) {
    for (const value of values) {
      try {
        await prisma.productVariation.upsert({
          where: {
            name_value: {
              name,
              value
            }
          },
          update: {},
          create: {
            name,
            value
          }
        });
        console.log(`Created/Updated variation: ${name} - ${value}`);
      } catch (error) {
        console.error(`Error creating variation ${name} - ${value}:`, error);
      }
    }
  }

  console.log('Finished seeding variations');
}

seedVariations()
  .catch((error) => {
    console.error('Error seeding variations:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 