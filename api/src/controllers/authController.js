// src/controllers/authController.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'

export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    const salt = await bcrypt.genSalt(5)
    const hashPassword = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword }
    })

    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao conectar ao servidor, tente novamente.' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha inválida' })
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '8h' })

    return res.status(200).json(token)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao conectar ao servidor, tente novamente.' })
  }
}
