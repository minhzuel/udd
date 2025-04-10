import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCategories() {
  try {
    console.log('Starting category validation and fix process...')

    // Get all categories
    const allCategories = await prisma.ecommerceCategory.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`Found ${allCategories.length} total categories`)

    // Check for circular references
    const circularRefs = new Set<string>()
    const visited = new Set<string>()
    const parentMap = new Map<string, string>()

    allCategories.forEach(cat => {
      if (cat.parentId) {
        parentMap.set(cat.id, cat.parentId)
      }
    })

    function detectCircular(categoryId: string, path = new Set<string>()) {
      if (path.has(categoryId)) {
        console.error(`Circular reference detected: ${Array.from(path).join(' -> ')} -> ${categoryId}`)
        path.forEach(id => circularRefs.add(id))
        return true
      }

      if (visited.has(categoryId)) {
        return false
      }

      visited.add(categoryId)
      path.add(categoryId)

      const parentId = parentMap.get(categoryId)
      if (parentId) {
        if (detectCircular(parentId, path)) {
          return true
        }
      }

      path.delete(categoryId)
      return false
    }

    // Check each category for circular references
    allCategories.forEach(cat => {
      if (!visited.has(cat.id)) {
        detectCircular(cat.id)
      }
    })

    if (circularRefs.size > 0) {
      console.log(`Found ${circularRefs.size} categories with circular references`)
      
      // Fix circular references by setting parentId to null
      await prisma.ecommerceCategory.updateMany({
        where: {
          id: {
            in: Array.from(circularRefs)
          }
        },
        data: {
          parentId: null
        }
      })
      
      console.log('Fixed circular references')
    }

    // Check for invalid parent references
    const validCategoryIds = new Set(allCategories.map(cat => cat.id))
    const invalidParentRefs = allCategories.filter(cat => 
      cat.parentId && !validCategoryIds.has(cat.parentId)
    )

    if (invalidParentRefs.length > 0) {
      console.log(`Found ${invalidParentRefs.length} categories with invalid parent references`)
      
      // Fix invalid parent references by setting parentId to null
      await prisma.ecommerceCategory.updateMany({
        where: {
          id: {
            in: invalidParentRefs.map(cat => cat.id)
          }
        },
        data: {
          parentId: null
        }
      })
      
      console.log('Fixed invalid parent references')
    }

    // Check for categories that appear as both parent and child
    const parentChildConflicts = allCategories.filter(cat =>
      cat.parentId && cat.children.length > 0
    )

    if (parentChildConflicts.length > 0) {
      console.log(`Found ${parentChildConflicts.length} categories that are both parent and child`)
      console.log('These categories may be valid, but should be reviewed:')
      parentChildConflicts.forEach(cat => {
        console.log(`- ${cat.name} (${cat.id}): parent of ${cat.children.length} categories, child of ${cat.parentId}`)
      })
    }

    console.log('Category validation and fix process completed')
  } catch (error) {
    console.error('Error fixing categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategories() 