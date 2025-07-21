// src/routes/datasetRoutes.ts
import express from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import auth from '../middlewares/auth.js'
import { uploadDataset } from '../controllers/datasetController.js'

const router = express.Router()

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './src/uploads')
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    cb(null, `${timestamp}-${file.originalname}`)
  }
})

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ext === '.csv' || ext === '.pdf') {
    cb(null, true)
  } else {
    cb(new Error('Apenas arquivos CSV e PDF são permitidos'))
  }
}

const upload = multer({ storage, fileFilter })

// Rota de upload de dataset
/**
 * @swagger
 * /datasets/upload:
 *   post:
 *     summary: Faz upload de um arquivo CSV ou PDF
 *     description: Permite ao usuário autenticado fazer upload de um dataset (CSV ou PDF). O conteúdo de arquivos CSV será automaticamente transformado em registros no banco.
 *     tags:
 *       - Datasets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo CSV ou PDF a ser enviado.
 *     responses:
 *       201:
 *         description: Upload e ingestão concluídos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 datasetId:
 *                   type: integer
 *       400:
 *         description: Nenhum arquivo enviado.
 *       401:
 *         description: Usuário não autenticado.
 *       500:
 *         description: Erro interno ao processar o upload.
 */

router.post('/datasets/upload', upload.single('file'), auth, uploadDataset)

export default router
