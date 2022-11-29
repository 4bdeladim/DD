import jwt, { JwtPayload } from 'jsonwebtoken' ;
import { Request, Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../interface';
import User from '../models/user';



export async function auth(req:IGetUserAuthInfoRequest, res:Response, next:NextFunction){
    const token = req.cookies[process.env.COOKIE_NAME as string]
    if(!token) return res.status(401).json({ msg: 'No token, auth denided'});
    try {
        const decoded = jwt.verify(token , process.env.JWT_KEY as string) as JwtPayload;
        const user = await User.findById(decoded.id);
        if(!user) next(new Error())
        next();
    } catch (error) {
        res.status(400).json({ msg: 'Token is not valid'})
    }
}



