import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      userId: number
      user?: User
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number
  }
}