import type { Request,Response } from "express";
import { createUser,findUserByEmail,findUserById,validateUser } from "../services/userAuthentication";
import { signinToken } from "../utils/tokenUtils";
import { authenticationMiddleware, type AuthRequest } from "../middleware/AuthenticationMiddleware";
import { sign } from "jsonwebtoken";

export async function signup(req:Request,res:Response){
    const {email,password} = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try{
        const existingUser = await findUserByEmail(email);
        if(existingUser){
            return res.status(401).json({
                error:"user already exists"
            })
        }
        const user = await createUser(email,password);
        const token = signinToken(user.id);
        res.json({
            token
        })
    }catch(err){
        res.status(500).json({
            error:"User Signup Failed"
        })
    }
}

export async function signin(req:Request,res:Response){
    const{email,password} = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try{
        const user = await validateUser(email,password);
        if(!user){
            return res.status(400).json({
                error:"Invalid credentials"
            })
        }
        const token = signinToken(user.id);
        res.json({
            token
        })
    }catch(err){
        res.status(500).json({
            error:"User Signin Failed"
        })
    }
}

export async function getUser(req:AuthRequest,res:Response){
    if(!req.user) return res.status(401).json({ error : "Unauthorized"});
    const user = await findUserById(req.user.id);
    if(!user) return res.status(401).json({ error : "User not found" });
    res.json({
        user:{
            id:user.id,
            email:user.email
        }
    })
}

export async function getBalance(req:AuthRequest,res:Response){
    if(!req.user) return res.status(401).json({
        error:"Unauthorized"
    })
    const user = await findUserById(req.user.id);
    if(!user) return res.status(401).json({
        error:"User not found"
    })
    res.json({
        user:{
            email:user.email,
            balance:user.balance.toNumber()
        }
    })
}