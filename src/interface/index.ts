import { Request } from "express"
export interface IUser {
    email: string,
    name: string,
    id: string,
    password: string,
    recoveryCode: string, 
    recoveringEttempts: number,
    confirmed: boolean,
    link: string,
    save: () => any,
    messages: [IChat]
}


interface IChat {
    room:string,
    member1: string,
    member2: string,
    chat: [IMessage | IMessage2]
}

interface IMessage {
    him: string,
    date: Date
}

interface IMessage2 {
    me: string,
    date: Date
}

export interface IGetUserAuthInfoRequest extends Request {
    user: string
}