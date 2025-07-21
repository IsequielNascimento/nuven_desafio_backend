// src/controllers/privateController.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { InferenceClient } from '@huggingface/inference'

const prisma = new PrismaClient()
const hf = new InferenceClient(process.env.HF_TOKEN)

// GET /users
export async function listarUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })
    res.status(200).json({ message: 'Usuários listados', users })
  } catch (error) {
    res.status(500).json({ message: 'Falha no servidor' })
  }
}

// GET /me
export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

// GET /datasets
export async function listarDatasets(req: Request, res: Response) {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    const datasets = await prisma.dataset.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(datasets)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar datasets' })
  }
}

// GET /datasets/:id/records
export async function listarRegistros(req: Request, res: Response) {
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

// GET /records/search?query=...
export async function buscarRegistros(req: Request, res: Response) {
  const query = req.query.query as string
  if (!query) return res.status(400).json({ message: 'Parâmetro de busca não informado' })

  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    const datasets = await prisma.dataset.findMany({
      where: { userId },
      select: { id: true }
    })

    const datasetIds = datasets.map(d => d.id)
    const records = await prisma.record.findMany({
      where: { datasetId: { in: datasetIds } }
    })

    const results = records.filter(record =>
      JSON.stringify(record.data).toLowerCase().includes(query.toLowerCase())
    )

    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar registros' })
  }
}



// POST /queries 
export async function criarConsulta(req: Request, res: Response) {
  const { question, datasetId } = req.body
  if (!question || !datasetId) {
    return res.status(400).json({ message: 'Pergunta e datasetId são obrigatórios' })
  }

  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    // Lógica de simulação de resposta com base em palavras-chave
    const answer = question.toLowerCase().includes('contrato')
      ? 'Este documento trata de cláusulas contratuais.'
      : 'A IA identificou informações relevantes.'

    // Registro da pergunta e da resposta simulada
    const query = await prisma.query.create({
      data: {
        userId,
        question,
        answer
      }
    })

    res.status(201).json(query)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar a consulta' })
  }
}

// GET /queries
export async function listarConsultas(req: Request, res: Response) {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    const queries = await prisma.query.findMany({
      where: { userId },
      select: { id: true, question: true, answer: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(queries)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico de consultas' })
  }
}

// POST /ai/query (Versão Híbrida com Registro no Banco)
export async function realizaConsultaIA(req: Request, res: Response) {
  const { question, datasetId }: { question: string; datasetId: number } = req.body;

  if (!question || !datasetId) {
    return res.status(400).json({ message: 'A pergunta e o ID do dataset são obrigatórios.' });
  }

  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    // Lógica de simulação (mock) para a palavra-chave "contrato"
    if (question.toLowerCase().includes('contrato')) {
      const mockAnswer = 'Este documento trata de cláusulas contratuais.';
      
      // Salva a pergunta e a resposta simulada no histórico
      const query = await prisma.query.create({
        data: { userId, question, answer: mockAnswer }
      });
      
      return res.status(200).json(query);
    }

    // Se não for a palavra-chave, continua com a chamada para a IA real
    const records = await prisma.record.findMany({
      where: { datasetId: datasetId, dataset: { userId: userId } },
    });

    if (records.length === 0) {
      return res.status(404).json({ message: 'Nenhum registro encontrado para este dataset ou acesso não permitido.' });
    }

    const context = records.map((record) => JSON.stringify(record.data)).join(" \n ");

    const response = await hf.questionAnswering({
      model: 'distilbert-base-cased-distilled-squad',
      inputs: {
        question: question,
        context: context
      }
    });
    
    const answer = response.answer || "A IA não pôde extrair uma resposta do documento.";

    // Salva a pergunta e a resposta da IA real no histórico
    const query = await prisma.query.create({
      data: { userId, question, answer }
    });

    res.status(200).json(query);

  } catch (error: any) {
    console.error('Erro ao consultar a API de IA externa:', error);
    res.status(500).json({ message: 'Erro ao processar a consulta de IA.', error: error.message });
  }
}