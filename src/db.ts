import mongoose, { Schema, model } from "mongoose";

const url: string = process.env.MONGODB_URI ;

mongoose.connect("mongodb+srv://hrushikesh44:dCkf2VMypSsBKha@cluster0.2lasb.mongodb.net/drain");

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
});

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String, 
    link: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }], 
    type: String, 
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true}
});

const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true}
});

export const ContentModel = model("Content", ContentSchema);
export const LinkModel = model("Link" , LinkSchema);