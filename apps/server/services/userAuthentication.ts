import { prisma } from "@repo/user_db";
import bcrypt from "bcrypt";

export async function createUser(email:string,password:string){
    const hashed = await bcrypt.hash(password,10);
    return prisma.user.create({
        data:{
            email,
            password:hashed
        }
    });
}

export async function findUserByEmail(email:string){
    return prisma.user.findUnique({
        where:{
            email
        }
    });
}

export async function findUserById(id:string){
    return prisma.user.findUnique({
        where:{
            id
        }
    });
}

export async function validateUser(email:string,password:string){
    const user = await findUserByEmail(email);
    if(!user) return null;
    const check = await bcrypt.compare(password,user.password);
    return check ? user : null;
}