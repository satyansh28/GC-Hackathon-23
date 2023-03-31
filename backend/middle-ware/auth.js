const axios = require("axios");
require("dotenv").config();
const auth_port = process.env.AUTH_PORT;
exports.checkLogin = (async (req,res,next) => {
    let token;
    
    if(req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
          new Error('You are not logged in! Please log in to get access.', 401)
        );
    }
    const response = await axios.post(`http://127.0.0.1:${auth_port}/auth/checkLogin`, {token});

    let user = response.data.currentUser;
    req.user = user;
    next();
})
