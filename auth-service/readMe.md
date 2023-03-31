Endpoints

1. Sign Up
POST /auth/signup
Request body:
{
    "name" : "Iron man",
    "email" : "iron.man@marvel.com",
    "password" : "Jarvis",
    "passwordConfirm" : "Jarvis"
}
Response:
{
    "status": "success",
    "message": "Verification URL is sent to your email!"
}

2. Verify Signup
POST /auth/verifySignUp/(token_sent_to_email)

3. Login
POST /auth/login
Request body:
{
    "email" : "iron.man@marvel.com",
    "password" : "Jarvis"
}
Res:
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTMxZDU3MDZhYmM5YmI1NzhmNTgzYSIsImlhdCI6MTY3ODk3NDY1NywiZXhwIjoxNjg2NzUwNjU3fQ.mfLbDDz4w6OOd5e_r7LUPxE5Ufvw6F4UY2OuzswdpZ8",
    "data": {
        "user": {
            "_id": "64131d5706abc9bb578f583a",
            "name": "Iron man",
            "email": "iron.man@marvel.com",
            "role": "user",
            "isVerified": true,
            "__v": 0
        }
    }
}

4. checkLogin
POST /auth/checkLogin
{
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTMxYzczNTAzZjI5NDI4Yzg5ZWQzMiIsImlhdCI6MTY3ODk3NDE0NiwiZXhwIjoxNjg2NzUwMTQ2fQ.ASZjb4ttqGmDE_0Lxo7JPhFYzY08X_NkmD_ssSxF3UQ"
}

Res:
{
    "status": "success",
    "role": "user",
    "loggedIn": true,
    "currentUser": {
        "_id": "64131d5706abc9bb578f583a",
        "name": "Iron man",
        "email": "iron.man@marvel.com",
        "role": "user",
        "isVerified": true,
        "__v": 0
    }
}