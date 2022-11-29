import express, {Express,Request, Response} from "express";
import auth from './routes/auth';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import socketIO, { Server } from "socket.io";
import http from "http"
dotenv.config();
const PORT = process.env.PORT || 6969;
const app:Express = express();
const server = http.createServer(app);
const mongoLink:string = process.env.DATABASE_URL || "" ;
const io = new Server(server);
mongoose.connect(mongoLink, () => {
    console.log("Mongo connected!");
})


io.on("connection", socket => { 
	socket.on('join-room', room => {
		socket.join(room)
	})
	socket.on('send-message', (message, room) => {
		console.log(message);
		if(room) {
			socket.to(room).emit('recieve-message', message)
		}
	})
	
});
app.use(bodyParser());
app.use(cookieParser())
app.use("/api/auth", auth);
server.listen(PORT, () => {
    console.log("Server is running!")
})