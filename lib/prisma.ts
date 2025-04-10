import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  // Add middleware for logging and error handling
  client.$use(async (params, next) => {
    const before = Date.now()
    try {
      const result = await next(params)
      const after = Date.now()
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
      return result
    } catch (error) {
      const after = Date.now()
      console.error(`Query ${params.model}.${params.action} failed after ${after - before}ms:`, error)
      
      // Log detailed parameters for debugging (but sanitize sensitive data)
      const sanitizedParams = { ...params }
      if (sanitizedParams.args?.data?.password) {
        sanitizedParams.args.data.password = '[REDACTED]'
      }
      console.error('Failed query parameters:', JSON.stringify(sanitizedParams, null, 2))
      
      throw error
    }
  })

  return client
}

// Create a connection with retry logic
async function getClient() {
  let retries = 5
  let client
  
  while (retries > 0) {
    try {
      client = globalForPrisma.prisma ?? createPrismaClient()
      
      // Test the connection
      await client.$queryRaw`SELECT 1`
      console.log('Database connection established successfully')
      
      return client
    } catch (error) {
      retries--
      console.error(`Failed to connect to database. Retries left: ${retries}`, error)
      
      if (retries <= 0) {
        console.error('Max retries reached, could not connect to database')
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Add an error event handler
prisma.$on('error', (e) => {
  console.error('Prisma client error:', e)
})

export { prisma }
export default prisma
