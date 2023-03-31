const mongoose = require("mongoose");
const schema=mongoose.Schema;

const room_schema=new schema({
    roomId:{
        type:String,
        required:true
    },
    creatorEmail:{
        type:String,
        required:true
    },
    allowAll:{
        type:Boolean,
        default:true
    },
    allowedEmails:{
        type:Array,
        default:[]
    }
},{timestamps:true});

const room= mongoose.model('Room',room_schema);
module.exports = room;