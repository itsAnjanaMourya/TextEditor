import express from 'express'
import { register, login, logout} from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.post("/registration", register)
userRouter.post('/login',login)
userRouter.post("/logout",logout)

export default userRouter;