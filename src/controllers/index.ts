import nodemailer from 'nodemailer';

interface Params {
    email: string,
    name: string,
    password: string
}


interface SendEmailParams {
    email: string,
    link: string
}
export function check(infos:Params){
    const {email, name, password} = infos;
    const check = /^\S+@\S+$/ ;
    if(name.length < 4 || password.length > 16 || password.length < 8 || !check.test(email)) return false
    return true
}


