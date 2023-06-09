const express = require('express')
const cookieParser = require('cookie-parser');
const app = express();
const path = require("path")
const http = require('http');
let xss = require("xss");
const { default: cluster } = require('cluster');
const room = require('./models/Room');
const auth=require('./middle-ware/auth')
require("dotenv").config();
const mongoose=require("mongoose")
const MONGODB_URI = process.env.MONGODB_URI;
const frontend= process.env.FRONTEND;
const Filter = require('bad-words')
let filter = new Filter();
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



  const cors=(req,res,next)=>{
	res.header("Access-Control-Allow-Origin", process.env.FRONTEND);
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header("Access-Control-Allow-Credentials",true);
	res.header("Access-Control-Expose-Headers","set-cookie");
	next();
  }
app.use(cookieParser());
app.use(cors)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//app.use(express.static(__dirname+"/build"))
app.options("*",(req,res)=>{res.status(200).send()});

app.post('/createRoom',auth.checkLogin,async(req,res)=>{
	const room_obj={
		creatorEmail : req.user.email,
		allowAll: req.body.allowAll,
		allowedEmails: req.body.allowedEmails,
		roomId: req.body.roomId,
		adminEmails: req.body.adminEmails
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
		res.status(200).send({isAdmin:room_obj.adminEmails.includes(userEmail),isCreator:(room_obj.creatorEmail===userEmail),err:false});
	else
		res.status(400).send({err:true});
})
// app.use((req, res) => {
// 	//res.sendFile(path.join(__dirname+"/build/index.html"))
// })



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
	socket.on('change-other', (data,sockid) => {
		data = sanitizeString(data)
		sockid = sanitizeString(sockid)

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

		if(ok){
			for(let a = 0; a < connections[key].length; ++a){
				io.to(connections[key][a]).emit("admin-commanded", data,sockid)
			}
		}
	})
	socket.on('chat-message', (data, sender) => {
		data = sanitizeString(data)
		sender = sanitizeString(sender)
		data=data?filter.clean(data):data
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
