import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const prisma = new PrismaClient()
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET
// REGISTER

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
    } catch (error) {
        res.status(500).json({ message: "Erro ao conectar ao servidor, tente novamente." })
    }
})


// LOGIN

router.post('/auth/login', async (req, res) => {

    try {

        const userInfo = req.body

        const user = await prisma.user.findUnique({
            where: { email: userInfo.email }
        })

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        const isMatch = await bcrypt.compare(userInfo.password, user.password)

        if(!isMatch){
            return res.status(400).json({message: 'Senha inválida'})
        }

        //Gerar Token JWT

        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '8h'})

        res.status(200).json(token)

    } catch (error) {
        res.status(500).json({ message: "Erro ao conectar ao servidor, tente novamente." })
    }


})

export default router