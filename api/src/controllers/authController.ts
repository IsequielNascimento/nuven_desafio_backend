// src/controllers/authController.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password }: { name: string; email: string; password: string } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' })
    }

    const salt = await bcrypt.genSalt(5)
    const hashPassword = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao conectar ao servidor, tente novamente.' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password }: { email: string; password: string } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha inválida' })
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '8h' })

    return res.status(200).json({ token })
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao conectar ao servidor, tente novamente.' })
  }
}
