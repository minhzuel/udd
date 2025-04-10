import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful')

    // Check categories
    const categories = await prisma.ecommerceCategory.findMany({
      where: {
        status: 'ACTIVE',
        isTrashed: false,
        parentId: null
      },
      include: {
        children: {
          where: {
            status: 'ACTIVE',
            isTrashed: false
          }
        }
      }
    })

    console.log('\nCategories Summary:')
    console.log(`Total root categories: ${categories.length}`)
    
    // Check for duplicate IDs
    const allIds = new Set<string>()
    const duplicateIds = new Set<string>()

    categories.forEach(category => {
      if (allIds.has(category.id)) {
        console.error(`Duplicate root category ID found: ${category.id} (${category.name})`)
        duplicateIds.add(category.id)
      }
      allIds.add(category.id)

      category.children.forEach(child => {
        if (allIds.has(child.id)) {
          console.error(`Duplicate child category ID found: ${child.id} (${child.name}) - Parent: ${category.name}`)
          duplicateIds.add(child.id)
        }
        allIds.add(child.id)

        if (child.parentId !== category.id) {
          console.error(`Invalid parent-child relationship: Child ${child.id} (${child.name}) has parentId ${child.parentId} but is listed under category ${category.id} (${category.name})`)
        }
      })
    })

    console.log(`Total unique IDs: ${allIds.size}`)
    if (duplicateIds.size > 0) {
      console.error(`Found ${duplicateIds.size} duplicate IDs:`, Array.from(duplicateIds))
    } else {
      console.log('No duplicate IDs found')
    }

  } catch (error) {
    console.error('Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase() 