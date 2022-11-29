import e, { Router, Request, Response } from "express";
import { check } from "../controllers";
import { IUser } from "../interface";
import User from "../models/user";
import { v4 as uuidv4 } from "uuid"
import { auth} from "../middleware";



const router:Router = Router();



router.post('/messages/:username', async(req:Request, res:Response, auth:Function) => {
    const reciever  = req.params.username
    const sender = req.body.username
    const message = req.body.message
    const room = uuidv4();
    await User.findOne({username: reciever})
        .then(async user => {
            if(!user) res.status(400)
            if(user) {
                let messages = user.messages
                let found = messages.find((conversation) => {
                    if(conversation.member1 === sender && conversation.member2 === reciever || conversation.member1 === reciever && conversation.member2 === sender) return true
                })
                if(found) {
                    let index = messages.indexOf(found)
                    messages[index].chat.push({
                        him: message,
                        date: new Date()
                    })
                    User.findOneAndUpdate({username: reciever}, {messages: messages}, (err:Error, user:IUser) => {
                        if(err) res.status(500)
                    })
                }
                if(!found) {
                    messages.push({
                        room: room,
                        member1: reciever,
                        member2: sender,
                        chat: [{
                            him: message,
                            date: new Date()
                        }]
                    })
                    User.findOneAndUpdate({username: reciever}, {messages: messages}, (err:Error, user:IUser) => {
                        if(err) res.status(500)
                    })
                }
            }
        }).catch(err => {
            res.status(500)
        })

        await User.findOne({username: sender})
        .then(async user => {
            if(!user) res.status(400)
            if(user) {
                let messages = user.messages
                let found = messages.find((conversation) => {
                    if(conversation.member1 === sender && conversation.member2 === reciever || conversation.member1 === reciever && conversation.member2 === sender) return true
                })
                if(found) {
                    let index = messages.indexOf(found)
                    messages[index].chat.push({
                        me: message,
                        date: new Date()
                    })
                    User.findOneAndUpdate({username:sender}, {messages: messages}, (err:Error, user:IUser) => {
                        if(err) res.status(500)
                    })
                }
                if(!found) {
                    messages.push({
                        room: room,
                        member1: reciever,
                        member2: sender,
                        chat: [{
                            me: message,
                            date: new Date()
                        }]
                    })
                    User.findOneAndUpdate({username: sender}, {messages: messages}, (err:Error, user:IUser) => {
                        if(err) res.status(500)
                    })
                }
            }
        }).catch(err => {
            res.status(500)
        })
        const user = await User.findOne({username: sender})
            .then(user => res.status(200).json(user)) 
});

router.get('/:client/messages/:username', async(req:Request, res:Response, auth:Function) => {
    try {
        const clientusername = req.params.client
        const chatusername = req.params.username
        User.findOne({username: clientusername}, (err:Error, user:IUser) => {
            const messages = user.messages
            const found = messages.find((conversation) => {
                if(conversation.member1 === clientusername && conversation.member2 === chatusername || conversation.member1 === chatusername && conversation.member2 === clientusername) return true
            })
            if(found){
                res.json({chat: found.chat, room: found.room})
            }
            res.status(200)
        })
    } catch (error) {
        res.status(500).json("Something went wrong")
    }      
})