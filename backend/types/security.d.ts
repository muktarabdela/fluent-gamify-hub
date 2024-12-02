declare namespace Express {
    export interface Request {
        user?: {
            userId: number;
            iat: number;
            exp: number;
        };
    }
} 