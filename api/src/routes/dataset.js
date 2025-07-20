import express from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import csvParser from 'csv-parser'
import e from 'express'
import auth from '../middlewares/auth.js'


const prisma = new PrismaClient()
const router = express.Router()

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads')
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    cb(null, `${timestamp}-${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ext === '.csv' || ext === '.pdf') {
    cb(null, true)
  } else {
    cb(new Error('Apenas arquivos CSV e PDF são permitidos'))
  }
}

const upload = multer({ storage, fileFilter })


router.post('/datasets/upload', upload.single('file'),auth, async (req, res) => {
  try {
    const file = req.file
    const userId = req.userId

    console.log(file)

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' })
    }

    const dataset = await prisma.dataset.create({
      data: {
        name: file.originalname,
       // size: file.size,
        userId: userId
      }
    })

    if (path.extname(file.originalname).toLowerCase() === '.csv') {
      const records = []

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
    return res.status(201).json({ message: 'Upload e ingestão concluídos', datasetId: dataset.id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao salvar registros' })
  }
})

    } else {
      return res.status(201).json({ message: 'Arquivo PDF salvo com sucesso', datasetId: dataset.id })
    }

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao fazer upload' })
  }
})



export default router