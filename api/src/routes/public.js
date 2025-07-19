import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/auth/register', async (req, res) => {
    try {
        const user = req.body

        const salt = await bcrypt.genSalt(5)
        const hashPassword = await bcrypt.hash(user.password, salt)

        // remover 'const userDB =' no final dos testes
        const userDB = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword,
            }
        })
        res.status(201).json(userDB)//alter 'userDB' parar alguma mensagem genérica 201
    }catch (err) {
        res.status(500).json({ message: "Erro ao conectar ao servidor, tente novamente." })
    }
})

export default router