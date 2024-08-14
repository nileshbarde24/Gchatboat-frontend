import jwt from "jsonwebtoken";
import { getDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
// Middleware to verify JWT token
// @ts-ignore
export async function authenticateToken(req, res, next) {
    // const token = req.header('Authorization');
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chatbot@123456789');
            // db ref
            const db = await getDatabase();
            //    @ts-ignore
            const _id = new ObjectId(decoded._id);
            const user = await db.collection('users').findOne({ _id });
            //    req.user = await User.findById(decoded._id).select('-password')
            // @ts-ignore
            req.user = user;
            // @ts-ignore
            req.userId = decoded._id;
            next();
        }
        catch (error) {
            console.log(error);
            res.status(401).send({ error: 'Not authorized' });
            // throw new Error('Not authorized')
        }
    }
    if (!token) {
        res.status(401).send({ error: 'Not authorized' });
        // throw new Error('Not authorized, no token')
    }
}
//# sourceMappingURL=authenticate.js.map