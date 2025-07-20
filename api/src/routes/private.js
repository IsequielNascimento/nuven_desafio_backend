import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const prisma = new PrismaClient()
const router = express.Router()

router.get('/listar-users', async (req,res) => {

    try{

        const users = await prisma.user.findMany({ omit: {password: true}})
        

        res.status(200).json({message: "Usuários listados", users})
    }catch(error){
        res.status(500).json({message: 'Falha no servidor'})
    }

})

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    res.status(200).json(user)

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário autenticado' })
  }
})

export default router