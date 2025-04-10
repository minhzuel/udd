import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const verifyJwtToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as { id: string }
  } catch (error) {
    console.error('Error verifying JWT token:', error)
    return null
  }
}

export const generateJwtToken = (payload: { id: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
} 