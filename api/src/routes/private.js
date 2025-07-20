// src/routes/private.ts
import express from 'express'

import pkg from 'express';
const { Request, Response } = pkg;

import {
  listarUsers,
  getMe,
  listarDatasets,
  listarRegistros,
  buscarRegistros,
  criarConsulta,
  listarConsultas
} from '../controllers/privateController.js'

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
router.get('/listar-users', listarUsers)

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
router.get('/me', getMe)

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
router.get('/datasets', listarDatasets)

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
router.get('/datasets/:id/records', listarRegistros)

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
router.get('/records/search', buscarRegistros)

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
router.post('/queries', criarConsulta)

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
router.get('/queries', listarConsultas)

export default router
