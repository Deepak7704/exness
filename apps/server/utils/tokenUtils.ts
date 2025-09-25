import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

export function signinToken(userId:string){
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}