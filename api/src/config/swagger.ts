import swaggerJsdoc, { Options } from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Desafio Técnico Backend - NUVEN',
            version: '1.0.0',
            description: 'Documentação da API para upload, consulta e IA simulada'
        },
        tags: [
            {
                name: 'Datasets',
                description: 'Operações relacionadas a upload e manipulação de datasets'
            }
        ],
        servers: [
            {
                url: 'http://localhost:3000'
            }
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
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts', './prisma/*.prisma']
}

const swaggerSpec = swaggerJsdoc(options)

/**
 * Configura o Swagger na aplicação Express
 * @param app Instância do Express
 */
export function setupSwagger(app: Express): void {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
