import express from "express";
import mongoose from "mongoose";
import { UserModel } from "db/client";
import {SignupSchema} from "common/types"
import "dotenv/config";

const uri = process.env.MONGO_URL;
if (!uri) throw new Error("MONGO_URI is not defined");

const app = express();
await mongoose.connect(uri)
console.log("✅ Connected to MongoDB Atlas");
app.use(express.json());

app.post("/signup", async (req, res)=>{
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success){
        res.status(403).json({
            message: "Incorrect Inputs"
        })
        return 
    }
    try{
        const user = await UserModel.create({
            username: data.username,
            password: data.password
        })
        res.json({
            id: user._id
        })
    }
    catch(e){
        res.status(411).json({
            message: "Username already exists",
            error: e
        })
    }
    
})

app.post("/signin", (req,res)=>{

})

app.post("/workflow", (req, res)=>{

})

app.put("/workflow", (req, res)=>{

})

app.get("/workflow/:workflowId", (req, res)=>{

})

app.get("/workflow/executions/:workflowId", (req, res)=>{

})

app.post("/credentials", (req, res)=>{

})

app.get("/credentials", (req,res)=>{

})

app.get("/nodes", (req, res)=>{
    
})

app.listen(process.env.PORT||3000)