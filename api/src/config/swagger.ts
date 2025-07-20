import swaggerJsdoc, { Options } from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Desafio Técnico Backend - NUVEN',
            version: '1.0.0',
            description: 'Documentação da API para upload, consulta e IA simulada'
        },
        tags: [
            { name: 'Auth', description: 'Operações de Autenticação' },
            { name: 'Datasets', description: 'Upload e manipulação de datasets' },
            { name: 'Busca', description: 'Busca textual nos dados' },
            { name: 'IA', description: 'Simulação de IA e histórico' },
            { name: 'Admin', description: 'Operações administrativas' }
        ],
        servers: [
            { url: 'http://localhost:3000' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ]
    },
    apis: [path.join(__dirname, '../routes/*.js')]
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Express): void {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}