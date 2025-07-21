import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: 'Acesso Negado' })
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET) as { id: number }
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token Inválido' })
  }
}

export default auth
