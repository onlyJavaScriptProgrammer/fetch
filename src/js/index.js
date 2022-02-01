import express from 'express'
import router from './router.js'

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use('/api', router)

const start = (port) => {
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'src/' })
  })
  app.listen(port, () => console.log(`Server working on port ${port}`))
}

start(port)