import express from  "express";
import cors from "cors";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import dotenv from "dotenv";
import mongoose from "mongoose";


const app = express();
dotenv.config();
const url: string = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

app.post('/signup', async (req, res) => {
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

app.post('/signin', async(req, res) => {
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

app.post('/content', userMiddleware, async(req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;

    await ContentModel.create({
        link,
        type,
        title,
        userId: req.userId,
        tags: []
    })

    res.status(200).json({
        message: "content added"
    })
})

app.get('/content', userMiddleware, async(req, res) => {
    const userId = req.userId;

    const content = await ContentModel.find({
        userId
    }).populate("userId", "username")

    res.json({
        content
    })
})

app.delete('/content', userMiddleware, async(req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteOne({
        contentId,
        userId: req.userId
    })

    res.json({
        message: "content deleted"
    })
})

app.post('/drain/share', userMiddleware, async(req, res) => {
    const share = req.body.share;

    if(share) {
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        })

        if(existingLink){

            res.json({
                hash: existingLink.hash
            })
            return
        }

        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash
        })

        res.json({
            hash
        })
    } else {
        await LinkModel.deleteOne({
            userId: req.userId
        })

        res.json({
            message: "link removed"
        })
    }
})

app.get('/drain/:shareLink', async(req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json({
            message:"link does not exist"
        })
        return
    }

    const content = await ContentModel.find({
        userId: link?.userId
    })

    const user = await UserModel.find({
        _id: link?.userId
    })

    if(!user){
        res.status(411).json({
            message: "User not found"
        })
        return
    }

    res.json({
        username: user,
        content: content
    })
})

async function main() {
    await mongoose.connect(url);
    app.listen(3000);
}

main();

