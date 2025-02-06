import express from  "express";
import cors from "cors";
import { UserModel } from "./db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";

const app = express();

app.use(express.json());
app.use(cors());

app.post('api/v1/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try{ 
        await UserModel.create({
            username: username,
            password: password
        })
        res.status(200).json({
            message: "Signed up successfully"
        })
    } catch(e){
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post('api/v1/signin', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await UserModel.findOne({
        username, 
        password
    })

    if(user){
        const token = jwt.sign({
            id: user._id
        }, JWT_PASSWORD)

        res.json(token)
    } else{
        res.status(411).json({
            message: "Invalid Credentials"
        })
    }
})

app.listen(3000);