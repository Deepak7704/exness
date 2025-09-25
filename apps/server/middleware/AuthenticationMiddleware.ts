import type { Request,Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenUtils";

export interface AuthRequest extends Request{
    user?:{id:string}
}
export function authenticationMiddleware(req:AuthRequest,res:Response,next:NextFunction){
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({
        error:"Token not found"
    })
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: "Token not provided"
        });
    }
    try{
        const payLoad = verifyToken(token);
        req.user = {id:payLoad.id};
        next();
    }catch{
        res.status(401).json({
            error:"Invalid token"
        })
    }

}