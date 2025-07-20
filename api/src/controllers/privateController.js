// src/controllers/privateController.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarUsers(req, res) {
  try {
    const users = await prisma.user.findMany({ omit: { password: true } })
    res.status(200).json({ message: 'Usuários listados', users })
  } catch (error) {
    res.status(500).json({ message: 'Falha no servidor' })
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário autenticado' })
  }
}

export async function listarDatasets(req, res) {
  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId: req.userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(datasets)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar datasets' })
  }
}

export async function listarRegistros(req, res) {
  const datasetId = parseInt(req.params.id)
  try {
    const records = await prisma.record.findMany({
      where: { datasetId },
      select: { id: true, data: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
    res.status(200).json(records)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar registros do dataset' })
  }
}

export async function buscarRegistros(req, res) {
  const { query } = req.query
  if (!query) return res.status(400).json({ message: 'Parâmetro de busca não informado' })

  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId: req.userId },
      select: { id: true }
    })

    const datasetIds = datasets.map(d => d.id)
    const records = await prisma.record.findMany({ where: { datasetId: { in: datasetIds } } })

    const results = records.filter(record =>
      JSON.stringify(record.data).toLowerCase().includes((query).toLowerCase())
    )

    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar registros' })
  }
}

export async function criarConsulta(req, res) {
  const { question, datasetId } = req.body
  if (!question || !datasetId) {
    return res.status(400).json({ message: 'Pergunta e datasetId são obrigatórios' })
  }

  try {
    const answer = question.toLowerCase().includes('contrato')
      ? 'Este documento trata de cláusulas contratuais.'
      : 'A IA identificou informações relevantes.'

    const query = await prisma.query.create({
      data: { userId: req.userId, question, answer }
    })

    res.status(201).json(query)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar a consulta' })
  }
}

export async function listarConsultas(req, res) {
  try {
    const queries = await prisma.query.findMany({
      where: { userId: req.userId },
      select: { id: true, question: true, answer: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(queries)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico de consultas' })
  }
}
