const express = require('express')
const cookieParser = require('cookie-parser');
const cors= require("cors");
const app = express();
const path = require("path")
let Pusher = require('pusher');
const http = require('http');
let xss = require("xss");
const { default: cluster } = require('cluster');
const room = require('./models/Room');
const auth=require('./middle-ware/auth')
require("dotenv").config();
const mongoose=require("mongoose")
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");    
  })
  .catch((err) => {
    console.log(err);
    console.log("Could not connect to MongoDB server! Shutting down...");
    process.exit(1);
  });
//Wrap express app in httpserver so that backend and socket server run on same port
let server = http.createServer(app)
let io = require("socket.io")(server, {
	cors: {
	  origin: "*"
	}
  });


let pusher = new Pusher({
	appId: process.env.APPID,
	key: process.env.KEY,
	secret:  process.env.SECRET,
	cluster: process.env.CLUSTER
  });

app.use(cookieParser());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(__dirname+"/build"))

app.post('/pusher/auth',(req, res)=> {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  let auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});
app.post('/createRoom',auth.checkLogin,async(req,res)=>{
	const room_obj={
		creatorEmail : req.user.email,
		allowAll: req.body.allowAll,
		allowedEmails: req.body.allowedEmails,
		roomId: req.body.roomId
	};
	const newRoom=await room.create(room_obj);
	if(newRoom)
		res.status(200).send({err:false});
	else 
		res.status(400).send({err:true});
})
app.post('/joinRoom',auth.checkLogin,async(req,res)=>{
	const userEmail=req.user.email;
	const room_obj=await room.findOne({roomId: req.body.roomId});
	if(room_obj && (room_obj.allowAll || room_obj.creatorEmail===userEmail || room_obj.allowedEmails.includes(userEmail)))
		res.status(200).send({isCreator:(room_obj.creatorEmail===userEmail),err:false});
	else
		res.status(400).send({err:true});
})
app.use((req, res) => {
	res.sendFile(path.join(__dirname+"/build/index.html"))
})



sanitizeString = (str) => {
	return xss(str)
}

let connections = {}
let messages = {}
let timeOnline = {}

io.on('connection', (socket) => {

	socket.on('join-call', (path) => {
		if(connections[path] === undefined){
			connections[path] = []
		}
		connections[path].push(socket.id)

		timeOnline[socket.id] = new Date()

		for(let a = 0; a < connections[path].length; ++a){
			io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
		}

		if(messages[path] !== undefined){
			for(let a = 0; a < messages[path].length; ++a){
				io.to(socket.id).emit("chat-message", messages[path][a]['data'], 
					messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
			}
		}

		console.log(path, connections[path])
		
	})

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message)
	})

	socket.on('chat-message', (data, sender) => {
		data = sanitizeString(data)
		sender = sanitizeString(sender)

		let key
		let ok = false
		for (const [k, v] of Object.entries(connections)) {
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
					key = k
					ok = true
				}
			}
		}

		if(ok === true){
			if(messages[key] === undefined){
				messages[key] = []
			}
			messages[key].push({"sender": sender, "data": data, "socket-id-sender": socket.id})
			console.log("message", key, ":", sender, data)

			for(let a = 0; a < connections[key].length; ++a){
				io.to(connections[key][a]).emit("chat-message", data, sender, socket.id)
			}
		}
	})

	socket.on('disconnect', () => {
		let diffTime = Math.abs(timeOnline[socket.id] - new Date())
		let key
		for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
					key = k

					for(let a = 0; a < connections[key].length; ++a){
						io.to(connections[key][a]).emit("user-left", socket.id)
					}
			
					let index = connections[key].indexOf(socket.id)
					connections[key].splice(index, 1)

					console.log(key, socket.id, Math.ceil(diffTime / 1000))

					if(connections[key].length === 0){
						delete connections[key]
					}
				}
			}
		}
	})
})

server.listen(process.env.PORT || 5000, () => {
	console.log("listening on", process.env.PORT || 5000)
})
