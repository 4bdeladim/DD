import { Router, Request, Response } from "express";
import { check } from "../controllers";
import { IUser } from "../interface";
import User from "../models/user";
import { v4 as uuidv4 } from "uuid"
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from "jsonwebtoken"
const router:Router = Router();

router.post("/register", async (req:Request, res:Response) => {
    try {
        const { email, name, password } = req.body ;
        if(!email || !name || !password) res.status(501).json("Missing field!")
        User.findOne({email: email}, async (err:Error, user:IUser) => {
            if(user) res.status(404).json("Email already used.")
            else {
                const checkInfo = check({email, name, password});
                const salt = bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(password, 10)
                if(!checkInfo) res.status(501).json("Invalid Informations");
                else {
                    const DOMAIN = process.env.DOMAIN || "http://localhost:6969/"
                    const RANDOM_LINK = uuidv4()+"email@@"+email;
                    const newUser = new User({email, name, password:hashedPassword, link: RANDOM_LINK});
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    })
                    const options = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: "Account verification",
                        html: `<a href="${DOMAIN+"api/auth/verify/"+RANDOM_LINK}">Verify ur account.</a>`
                    }
                    transporter.sendMail(options, (err) => {
                        if(err) {
                            res.status(404).json("Something went wrong!")
                        }
                        return;
                    })
                    newUser.save()
                        .then((user) => {
                            res.status(200).json("Account created please check ur email for confirmation!") 
                        }).catch((err) => {
                            res.status(500).json("Error")
                        })
                }  
            }
        })
    } catch (error) {
        res.status(500).json("Something went wrong!");
    }
})

router.get("/verify", (req:Request, res:Response) => {
    try {
        const link = req.params.link;
        const email = link.split("email@@")[1];
        User.findOne({email: email}, async(err:Error, user:IUser) => {
            if(!user) res.status(401).json("Invalid link")
            else {
                console.log(user.recoveryCode, link)
                if(user.link !== link) res.status(401).json("Invalid code")
                else {
                    user.confirmed = true;
                    await user.save();
                    res.status(200).json("Verification succeded!")
                }
            }
        })
    } catch (error) {
        res.status(501).json("Something went wrong")
    }
    

})
router.post("/login", (req:Request, res:Response) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) res.status(404).json("Missing information")
        else {
            User.findOne({email: email}, (err:Error, user:IUser) => {
                if(!user) return res.status(401).json("Invalid email")
                bcrypt.compare(password, user.password)
                    .then((isMatch:boolean) => {
                        if(!isMatch) return res.status(401).json("Incorrect password")
                        jwt.sign(
                            {id: user.id},
                            process.env.JWT_KEY as string,
                            (err: any, token: string | undefined) => {
                                res.cookie(process.env.COOKIE_NAME as string, token, {httpOnly: true, maxAge: (60 * 100 * 60 * 60 )}).json(user.name);
                            }
                        )
                    })

            })
        }
    } catch (error) {
        res.status(500).json("Something went wrong")
    }
})



router.get("/checkauth", async (req:Request, res:Response) => {
    try {
        const token = req.cookies[process.env.COOKIE_NAME as string]
        if(!token) res.status(200).json("Invalid token")
        else {
            const { id } =  jwt.verify(token, process.env.JWT_KEY as string) as JwtPayload;
            User.findById(id, (err:Error, user:IUser) => {
                if(!user) res.status(404)
                res.status(200).json(user.name);
            })
        }
    } catch (error) {
        res.status(500).json("Something went wrong")
    }
})
export default router;