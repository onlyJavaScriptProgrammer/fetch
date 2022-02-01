import Router from 'express'
import controller from './controller.js'

const router = new Router()

router.get('/data', controller.getData)

export default router
