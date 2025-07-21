
# 🧠 API - Desafio Técnico Backend

Este projeto é uma solução desenvolvida para a segunda etapa do processo seletivo da vaga de Desenvolvedor Backend no NUVEN – Núcleo de visão computacional e engenharia.

---

## 🚀 Sobre o Projeto

A proposta é criar uma API RESTful que simula o backend de uma plataforma para ingestão e gerenciamento de documentos. Entre as funcionalidades estão:

- Autenticação com JWT
- Upload de arquivos `.csv` e `.pdf`
- Busca textual dentro dos dados enviados
- Consulta simulada com IA (via Hugging Face)
- Persistência em PostgreSQL com Prisma

---

## 🧭 Conteúdo

- [📥 Fluxo de Requisição](#-fluxo-de-requisição)
- [🧰 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📁 Estrutura de Pastas](#-estrutura-de-pastas)
- [⚙️ Configuração do Ambiente](#️-configuração-do-ambiente)
- [📚 Como Usar a API](#-como-usar-a-api)
- [✅ Testes Automatizados](#-testes-automatizados)
- [🔗 Endpoints da API](#-endpoints-da-api)

---

## 📥 Fluxo de Requisição

Abaixo está o fluxo típico de uma requisição de upload (`POST /datasets/upload`), que passa por autenticação, middleware, upload e persistência:

<img width="720" alt="fluxograma" src="docs/Fluxograma.svg" />

---

## 🧰 Tecnologias Utilizadas

- **Node.js** + **Express**
- **PostgreSQL** com **Prisma ORM**
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Vitest + Supertest** para testes automatizados
- **Docker + Docker Compose**
- **Swagger UI** para documentação da API
- **Hugging Face Inference API** (IA simulada — opcional)

---

## 📁 Estrutura de Pastas

```bash
api/
├── prisma/               # Schema e migrations do Prisma
├── src/
│   ├── config/           # Configurações globais (ex: Swagger)
│   ├── controllers/      # Lógica de negócio
│   ├── middlewares/      # Middlewares (como auth)
│   ├── routes/           # Arquivos de rotas
│   └── uploads/          # Arquivos temporários de upload
├── tests/                # Testes automatizados
├── .env                  # Variáveis de ambiente (não versionado)
├── Dockerfile
└── docker-compose.yml
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Git
- Docker + Docker Compose

### Passos para rodar localmente

```bash
git clone https://github.com/IsequielNascimento/nuven_desafio_backend.git
cd nuven_desafio_backend
```

Configure as variáveis de ambiente:


```bash
cd api
npm i
```

Crie e Preencha as variáveis em .env:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/backend"
JWT_SECRET="sua_chave_jwt"
HF_TOKEN="seu_token_huggingface"
```

Depois, volte para a raiz:

```bash
cd..
```

e rode:

```bash
# Na raiz do projeto
docker-compose up -d db
```

Aplique as Migrações: Crie as tabelas no banco de dados

```bash
# Dentro da pasta api/
npx prisma migrate dev
```

Execute os Testes:
```bash
# Dentro da pasta api/
npm test
```

Suba os containers:
Na pasta raiz do projeto, execute:
```bash
docker-compose up --build
```

A API estará acessível em:  
👉 `http://localhost:3000`  
👉 Documentação Swagger: `http://localhost:3000/docs`

---

## 📚 Como Usar a API

A API pode ser testada diretamente pela interface Swagger gerada automaticamente:

📄 Acesse: [http://localhost:3000/docs](http://localhost:3000/docs)

Use os endpoints com um token JWT válido gerado via `/auth/login`.

---

## ✅ Testes Automatizados

Testes com **Vitest** e **Supertest** cobrem o fluxo de autenticação:

```bash
cd api
npm install
npm test
```

---

## 🔗 Endpoints da API

| Método | Rota                    | Descrição                                      | Auth |
|--------|-------------------------|------------------------------------------------|:----:|
| POST   | `/auth/register`        | Cria um novo usuário                           | ❌   |
| POST   | `/auth/login`           | Retorna token JWT após login                   | ❌   |
| GET    | `/me`                   | Retorna dados do usuário autenticado           | ✅   |
| POST   | `/datasets/upload`      | Faz upload de CSV ou PDF                       | ✅   |
| GET    | `/datasets`             | Lista os datasets do usuário                   | ✅   |
| GET    | `/datasets/:id/records` | Lista registros de um dataset                  | ✅   |
| GET    | `/records/search`       | Busca textual nos registros do usuário         | ✅   |
| POST   | `/queries`              | Envia pergunta à IA e registra a resposta      | ✅   |
| GET    | `/queries`              | Lista consultas anteriores feitas pelo usuário | ✅   |
| POST   | `/ai/query`             | (opcional) Consulta IA via Hugging Face        | ✅   |

<!-- ---

## ✅ Entregas Concluídas

- [x] Upload de `.csv` e `.pdf` com Multer
- [x] Registro de datasets e metadados no banco
- [x] Salvamento do conteúdo `.csv` como JSON
- [x] Consulta por palavra-chave
- [x] Autenticação com JWT
- [x] Endpoint `/me`
- [x] Integração com Hugging Face (IA)
- [x] Testes automatizados com Vitest
- [x] Documentação Swagger
- [x] Dockerfile e docker-compose
- [x] Fluxograma incluído no README

--- -->
