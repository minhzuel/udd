import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Define 20 main categories
const mainCategories = [
  { name: 'Electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', description: 'Apparel and fashion items' },
  { name: 'Home & Kitchen', description: 'Home goods and kitchen accessories' },
  { name: 'Books', description: 'Books and reading materials' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
  { name: 'Beauty & Health', description: 'Beauty products and health supplies' },
  { name: 'Toys & Games', description: 'Toys, games, and entertainment items' },
  { name: 'Automotive', description: 'Car parts, accessories, and tools' },
  { name: 'Grocery', description: 'Food and grocery items' },
  { name: 'Pet Supplies', description: 'Products for pets and animals' },
  { name: 'Jewelry', description: 'Rings, necklaces, and other jewelry items' },
  { name: 'Office Supplies', description: 'Office equipment and stationery' },
  { name: 'Baby Products', description: 'Products for babies and infants' },
  { name: 'Art & Crafts', description: 'Art supplies and craft materials' },
  { name: 'Garden & Outdoor', description: 'Gardening tools and outdoor equipment' },
  { name: 'Furniture', description: 'Home and office furniture' },
  { name: 'Music & Instruments', description: 'Musical instruments and equipment' },
  { name: 'Tools & Home Improvement', description: 'Tools and home improvement items' },
  { name: 'Travel & Luggage', description: 'Travel gear and luggage' },
  { name: 'Digital Content', description: 'Digital downloads and content' }
]

// Function to generate products for a given category
function generateProductsForCategory(categoryName: string, startIndex: number): any[] {
  const products = []
  
  // Create templates based on category
  let templates = []
  
  switch(categoryName) {
    case 'Electronics':
      templates = [
        { base: 'Smartphone', price: 699.99, beforeDiscount: 799.99 },
        { base: 'Laptop', price: 999.99, beforeDiscount: 1299.99 },
        { base: 'Tablet', price: 399.99, beforeDiscount: 499.99 },
        { base: 'Smartwatch', price: 249.99, beforeDiscount: 299.99 },
        { base: 'Headphones', price: 149.99, beforeDiscount: 199.99 },
        { base: 'Bluetooth Speaker', price: 79.99, beforeDiscount: 99.99 },
        { base: 'Digital Camera', price: 599.99, beforeDiscount: 699.99 },
        { base: 'Smart TV', price: 899.99, beforeDiscount: 999.99 },
        { base: 'Gaming Console', price: 499.99, beforeDiscount: 549.99 },
        { base: 'Wireless Earbuds', price: 129.99, beforeDiscount: 159.99 }
      ]
      break
    case 'Clothing':
      templates = [
        { base: 'T-Shirt', price: 24.99, beforeDiscount: 29.99 },
        { base: 'Jeans', price: 49.99, beforeDiscount: 59.99 },
        { base: 'Sweater', price: 39.99, beforeDiscount: 49.99 },
        { base: 'Jacket', price: 89.99, beforeDiscount: 99.99 },
        { base: 'Dress', price: 59.99, beforeDiscount: 69.99 },
        { base: 'Shorts', price: 29.99, beforeDiscount: 34.99 },
        { base: 'Socks', price: 9.99, beforeDiscount: 12.99 },
        { base: 'Hat', price: 19.99, beforeDiscount: 24.99 },
        { base: 'Scarf', price: 14.99, beforeDiscount: 19.99 },
        { base: 'Gloves', price: 19.99, beforeDiscount: 24.99 }
      ]
      break
    // Other categories with their base templates
    default:
      // Generic products for all other categories
      const basePrices = [19.99, 29.99, 39.99, 49.99, 59.99, 69.99, 79.99, 89.99, 99.99, 119.99]
      templates = Array(10).fill(null).map((_, i) => ({
        base: `${categoryName} Item`,
        price: basePrices[i % basePrices.length],
        beforeDiscount: basePrices[i % basePrices.length] * 1.2
      }))
  }
  
  // Generate 20 products using templates
  for (let i = 0; i < 20; i++) {
    const template = templates[i % templates.length]
    const index = startIndex + i
    const qualifiers = ['Premium', 'Deluxe', 'Professional', 'Advanced', 'Basic', 'Standard', 'Elite', 'Ultra', 'Pro', 'Max']
    const qualifier = qualifiers[i % qualifiers.length]
    
    // Apply price variations by +/- 5-15%
    const priceAdjustment = 1 + ((i % 5) * 0.03)
    const price = Math.round(template.price * priceAdjustment * 100) / 100
    const beforeDiscount = Math.round(template.beforeDiscount * priceAdjustment * 100) / 100
    
    // Generate product name with qualifier
    const productName = `${qualifier} ${template.base} ${String.fromCharCode(65 + (i % 26))}-${Math.floor(i/10) + 1}${i % 10}`
    
    // Generate variations based on product type
    const variations = []
    
    // Common variations
    if (['Smartphone', 'Laptop', 'Tablet', 'Digital Camera', 'Smart TV'].some(item => template.base.includes(item))) {
      variations.push(
        { name: 'Color', value: 'Black', stockValue: 20 },
        { name: 'Color', value: 'Silver', stockValue: 15 },
        { name: 'Color', value: 'Gold', stockValue: 10 },
        { name: 'Storage', value: '128GB', stockValue: 15 },
        { name: 'Storage', value: '256GB', price: price * 1.15, stockValue: 10 },
        { name: 'Storage', value: '512GB', price: price * 1.3, stockValue: 5 }
      )
    } else if (['T-Shirt', 'Sweater', 'Jacket', 'Dress', 'Shorts'].some(item => template.base.includes(item))) {
      variations.push(
        { name: 'Color', value: 'Black', stockValue: 10 },
        { name: 'Color', value: 'White', stockValue: 10 },
        { name: 'Color', value: 'Blue', stockValue: 10 },
        { name: 'Color', value: 'Red', stockValue: 10 },
        { name: 'Size', value: 'S', stockValue: 15 },
        { name: 'Size', value: 'M', stockValue: 20 },
        { name: 'Size', value: 'L', stockValue: 15 },
        { name: 'Size', value: 'XL', stockValue: 10 }
      )
    } else {
      // Generic variations for other products
      variations.push(
        { name: 'Color', value: 'Standard', stockValue: 20 },
        { name: 'Color', value: 'Deluxe', stockValue: 15 },
        { name: 'Size', value: 'Regular', stockValue: 20 },
        { name: 'Size', value: 'Large', price: price * 1.2, stockValue: 15 }
      )
    }
    
    // Generate unique SKU
    const sku = `${categoryName.substring(0, 3).toUpperCase()}-${index}`
    
    products.push({
      name: productName,
      sku,
      description: `High-quality ${qualifier.toLowerCase()} ${template.base.toLowerCase()} with premium features and design.`,
      price,
      beforeDiscount,
      categoryName,
      stockValue: 50 + (i * 5),
      thumbnail: `https://picsum.photos/seed/${sku}/400/400`,
      variations
    })
  }
  
  return products
}

async function main() {
  try {
    console.log('Starting enhanced seed process...')

    // Create admin role if it doesn't exist
    let adminRole = await prisma.userRole.findUnique({
      where: { slug: 'admin' }
    })

    if (!adminRole) {
      adminRole = await prisma.userRole.create({
        data: {
          slug: 'admin',
          name: 'Administrator',
          description: 'Administrator role with full access',
          isProtected: true,
          isDefault: false
        }
      })
      console.log('Admin role created.')
    }

    // Create admin user if it doesn't exist
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    if (!adminUser) {
      const hashedPassword = await hash('admin123', 10)
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          roleId: adminRole.id,
          status: 'ACTIVE'
        }
      })
      console.log('Admin user created.')
    }

    // Create customer role if it doesn't exist
    let customerRole = await prisma.userRole.findUnique({
      where: { slug: 'customer' }
    })

    if (!customerRole) {
      customerRole = await prisma.userRole.create({
        data: {
          slug: 'customer',
          name: 'Customer',
          description: 'Regular customer role',
          isProtected: true,
          isDefault: true
        }
      })
      console.log('Customer role created.')
    }

    // Create main categories
    const categoryMap = new Map()
    
    for (const category of mainCategories) {
      const existingCategory = await prisma.ecommerceCategory.findFirst({
        where: { 
          name: category.name,
          isTrashed: false
        }
      })

      if (!existingCategory) {
        const createdCategory = await prisma.ecommerceCategory.create({
          data: {
            name: category.name,
            slug: category.name.toLowerCase().replace(/\s+/g, '-'),
            description: category.description,
            createdByUserId: adminUser.id,
            status: 'ACTIVE'
          }
        })
        categoryMap.set(category.name, createdCategory.id)
        console.log(`Category created: ${category.name}`)
      } else {
        categoryMap.set(category.name, existingCategory.id)
        console.log(`Category already exists: ${category.name}`)
      }
    }

    // Generate products for each category
    let productIndex = 1
    for (const category of mainCategories) {
      const products = generateProductsForCategory(category.name, productIndex)
      productIndex += products.length
      
      const categoryId = categoryMap.get(category.name)
      if (!categoryId) {
        console.log(`Category not found for products: ${category.name}`)
        continue
      }
      
      // Create products with variations
      for (const product of products) {
        const existingProduct = await prisma.ecommerceProduct.findFirst({
          where: { sku: product.sku }
        })

        if (!existingProduct) {
          const createdProduct = await prisma.ecommerceProduct.create({
            data: {
              name: product.name,
              sku: product.sku,
              description: product.description,
              price: product.price,
              beforeDiscount: product.beforeDiscount,
              stockValue: product.stockValue,
              status: 'PUBLISHED',
              thumbnail: product.thumbnail,
              categoryId: categoryId,
              createdByUserId: adminUser.id
            }
          })

          // Create variations
          for (const variation of product.variations) {
            await prisma.productVariation.create({
              data: {
                productId: createdProduct.id,
                name: variation.name,
                value: variation.value,
                stockValue: variation.stockValue,
                price: variation.price
              }
            })
          }

          console.log(`Product created: ${product.name}`)
        } else {
          console.log(`Product already exists: ${product.name}`)
        }
      }
      
      console.log(`Completed adding 20 products to category: ${category.name}`)
    }

    console.log('Enhanced seed completed successfully!')
  } catch (error) {
    console.error('Error during seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error during seed:', error)
    process.exit(1)
  }) 