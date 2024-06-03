import AppError from "../utils/AppError";
import jwt from 'jsonwebtoken';


interface User {
    id: string;
    username: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
}

const verifyToken = (context?: any): User | null => {
    const authHeader = context.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as User;
        } catch(err) {
            throw new AppError('Invalid or expired token', 401);
        }
    } else {
        throw new AppError('Authentication token is required', 401);
    }
};

export { verifyToken };
