// src/controllers/datasetController.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'

const prisma = new PrismaClient()

interface MulterRequest extends Request {
  file?: Express.Multer.File
  userId?: number
}

export async function uploadDataset(req: MulterRequest, res: Response): Promise<Response | void> {
  try {
    const file = req.file
    const userId = req.userId

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' })
    }

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' })
    }

    const dataset = await prisma.dataset.create({
      data: {
        name: file.originalname,
        userId: userId
      }
    })

    const ext = path.extname(file.originalname).toLowerCase()

    if (ext === '.csv') {
      const records: any[] = []

      fs.createReadStream(file.path)
        .pipe(csvParser())
        .on('data', (data) => records.push(data))
        .on('end', async () => {
          try {
            await Promise.all(
              records.map((record) =>
                prisma.record.create({
                  data: {
                    datasetId: dataset.id,
                    data: record
                  }
                })
              )
            )
            return res
              .status(201)
              .json({ message: 'Upload e ingestão concluídos', datasetId: dataset.id })
          } catch (err) {
            console.error(err)
            return res.status(500).json({ message: 'Erro ao salvar registros' })
          }
        })
    } else {
      return res
        .status(201)
        .json({ message: 'Arquivo PDF salvo com sucesso', datasetId: dataset.id })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao fazer upload' })
  }
}
