import bcrypt from 'bcrypt'
import userModel from '../models/user.schema.js'
import jwt from 'jsonwebtoken'
import blacklist from '../middleware/blacklist.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, "username")
    console.log("post api test")
    try {
        bcrypt.hash(password, 5, async (err, hash) => {
            if (err) {
                console.log("error", err)
                res.status(500).send({ "msg": 'something is wrong' })
            } else {
                const RegisterUser = new userModel({ username: name, email, password: hash })
                await RegisterUser.save()
                res.status(200).send({ 'message': 'registration seccessful!', user: RegisterUser })
            }

        })
    } catch (error) {
        res.status(400).send({ error: 'user is not register!' })
    }
}



export const login = async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            console.log('Token:--', token);
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const user = await userModel.findById(decoded.id).select('-password');
            res.status(200).json({ message: "You are Logged in by refresh!", token: token, user: user })
        } catch (error) {

            res.status(401).json({ message: "login again"})
        }
    }
    else {
        const { email, password } = req.body;
        try {
            const user = await userModel.findOne({ email });
            if (user) {
                bcrypt.compare(password, user.password, (error, result) => {
                    if (result) {
                        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)
                        res.status(200).json({ message: "You are Logged in !", token: token, user: user })
                    } else if (error) {
                        res.status(400).json({ message: 'Invalid Credentials', error })
                    }

                })
            } else {
                res.status(400).json({ message: 'Invalid Credential' })
            }

        } catch (error) {
            console.log(error)
        }

    }

}

export const logout = async (req, res) => {
    console.log("logout controller")
    const token = req.headers.authorization?.split(" ")[1]
    console.log(token)
    try {
        if (token) {
            blacklist.push(token)
            res.status(200).json({ message: "you are logOut!" })
        }
    } catch (error) {

        res.status(400).json({ message: error })
    }
}