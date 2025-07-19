import express from 'express'

const router = express.Router()

router.post('/auth/register', (req, res) => {
    const user = req.body

    res.status(201).json(user)
})

export default router