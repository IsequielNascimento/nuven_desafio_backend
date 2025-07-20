import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const prisma = new PrismaClient()
const router = express.Router()

/**
 * @swagger
 * /listar-users:
 *   get:
 *     summary: Lista todos os usuários cadastrados (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/listar-users', async (req,res) => {

    try{

        const users = await prisma.user.findMany({ omit: {password: true}})
        

        res.status(200).json({message: "Usuários listados", users})
    }catch(error){
        res.status(500).json({message: 'Falha no servidor'})
    }

})

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 */
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
/**
 * @swagger
 * /datasets:
 *   get:
 *     summary: Lista os datasets do usuário autenticado
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de datasets
 */
router.get('/datasets', async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      where: {
        userId: req.userId
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json(datasets)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao buscar datasets' })
  }
})
/**
 * @swagger
 * /datasets/{id}/records:
 *   get:
 *     summary: Lista os registros de um dataset específico
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de registros do dataset
 */
router.get('/datasets/:id/records', async (req, res) => {
  const datasetId = parseInt(req.params.id)

  try {
    const records = await prisma.record.findMany({
      where: {
        datasetId: datasetId
      },
      select: {
        id: true,
        data: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    res.status(200).json(records)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao buscar registros do dataset' })
  }
})
/**
 * @swagger
 * /records/search:
 *   get:
 *     summary: Busca textual em registros dos datasets do usuário
 *     tags: [Busca]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de registros encontrados
 */
router.get('/records/search', async (req, res) => {
  const { query } = req.query

  if (!query) {
    return res.status(400).json({ message: 'Parâmetro de busca não informado' })
  }

  try {
    // Busca todos os registros do usuário
    const datasets = await prisma.dataset.findMany({
      where: {
        userId: req.userId
      },
      select: {
        id: true
      }
    })

    const datasetIds = datasets.map(d => d.id)

    const records = await prisma.record.findMany({
      where: {
        datasetId: { in: datasetIds }
      }
    })

    // Filtro textual em memória (por ser JSON)
    const results = records.filter(record =>
      JSON.stringify(record.data).toLowerCase().includes(query.toLowerCase())
    )

    res.status(200).json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao buscar registros' })
  }
})


/**
 * @swagger
 * /queries:
 *   post:
 *     summary: Envia uma pergunta para simulação de IA
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               datasetId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Resposta simulada gerada
 */
router.post('/queries', async (req, res) => {
  const { question, datasetId } = req.body

  if (!question || !datasetId) {
    return res.status(400).json({ message: 'Pergunta e datasetId são obrigatórios' })
  }

  try {
    // IA mockada
    let answer = ''
    if (question.toLowerCase().includes('contrato')) {
      answer = 'Este documento trata de cláusulas contratuais.'
    } else {
      answer = 'A IA identificou informações relevantes.'
    }

    // Salva no banco
    const query = await prisma.query.create({
      data: {
        userId: req.userId,
        question,
        answer
      }
    })

    res.status(201).json(query)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao registrar a consulta' })
  }
})

/**
 * @swagger
 * /queries:
 *   get:
 *     summary: Lista o histórico de consultas do usuário
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perguntas e respostas
 */

router.get('/queries', async (req, res) => {
  try {
    const queries = await prisma.query.findMany({
      where: {
        userId: req.userId
      },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json(queries)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao buscar histórico de consultas' })
  }
})



export default router