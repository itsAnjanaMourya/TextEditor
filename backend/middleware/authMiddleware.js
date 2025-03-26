import jwt from 'jsonwebtoken';
import userModel from '../models/user.schema.js';

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token:', token);
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = await userModel.findById(decoded.id).select('-password');
            console.log("user found",req.user)
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


export default protect;
