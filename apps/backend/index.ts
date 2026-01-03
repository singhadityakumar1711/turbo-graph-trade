import express from "express";
import mongoose from "mongoose";
import { ExecutionsModel, NodesModel, UserModel, WorkflowModel } from "db/client";
import {SignupSchema, SigninSchema, CreateWorkflowSchema, UpdateWorkflowSchema} from "common/types"
import "dotenv/config";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";

const uri = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET!;
const bcrypt = require('bcrypt');
if (!uri) throw new Error("MONGO_URI is not defined");

const app = express();
await mongoose.connect(uri)
console.log("✅ Connected to MongoDB Atlas");
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.post("/signup", async (req, res)=>{
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success){
        return res.status(400).json({
            message: "Incorrect Inputs"
        })
    }
    try{
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await UserModel.create({
            username: data.username,
            password: hashedPassword
        })
        console.log("User created successfully");
        return res.status(200).json({
            message: "User created successfully",
            id: user._id
        })
    }
    catch(e:any){
        // MongoDB error code 11000 means a duplicate key error (username exists)
        if (e.code === 11000) {
            return res.status(409).json({ // 409 Conflict is standard for duplicates
                message: "Username already exists"
            });
        }
        // Generic server error for anything else
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

app.post("/signin", async (req,res)=>{
    const {success, data} = SigninSchema.safeParse(req.body);
    if (!success){
        return res.status(400).json({
            message: "Incorrect Inputs"
        })
    }
    try{
        const user = await UserModel.findOne({
            username: data.username
        })
        if (user){
            const passwordMatch = await bcrypt.compare(data.password, user.password);
            if(passwordMatch){
                const token = jwt.sign({
                    id: user._id
                }, JWT_SECRET)
                console.log("User exits. Sign in successful")
                return res.status(200).json({
                    token: token
                })
            }
            else{
                return res.status(401).json({
                    message: "Invalid Password"
                });
            }
        }
        else{
            return res.status(401).json({
                message: "Invalid Username"
            })
        }
    }
    catch(e){
        return res.status(500).json({
            message: "Internal Server Error",
            error: e
        })
    }
})

app.post("/workflow", authMiddleware, async (req, res)=>{
    const userId = req.userId!;
    const result = CreateWorkflowSchema.safeParse(req.body);
    if(!result.success){
        console.error("Validation error:", JSON.stringify(result.error.issues, null, 2));
        return res.status(400).json({
            message: "Incorrect Inputs",
            errors: result.error.issues
        })
    }
    const data = result.data;
    const workflowTitle = await WorkflowModel.find({title: data.title, userId : userId});
    // console.log("--------")
    // console.log(workflowTitle)
    // console.log("--------")
    // console.log(data)
    // console.log("--------")
    // console.log(userId)
    if(workflowTitle.length>0){
        return res.status(409).json({
            message: "Workflow with the same title already exists for the user"
        })
    }
    try{    
        const workflow = await WorkflowModel.create({
            userId: userId,
            title: data.title,
            nodes: data.nodes,
            edges: data.edges,
            // workflowId: data.title+"-"+userId
        })
        console.log("Workflow created successfully")
        return res.status(200).json({
            message: "Workflow created successfully",
            id:workflow._id
        })
    }
    catch(e:any) {
    console.error("FULL ERROR DETAILS:", e); // <--- Add this
    return res.status(500).json({
        message: "Internal Server Error",
        error: e.message // Send the message specifically
    });
}
})

app.put("/workflow/:workflowId", authMiddleware, async (req, res)=>{
    const userId = req.userId!;
    const {success, data} = UpdateWorkflowSchema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            message: "Incorrect Inputs"
        })
    }
    const workflowTitle = await WorkflowModel.find({title: data.newTitle, userId: userId});
    // console.log(workflowTitle)
    if(workflowTitle.length>0 && data.newTitle!=data.prevTitle){
        return res.status(409).json({
            message: "Workflow with the same title already exists for the user"
        })
    }
    try{
        const updateData: any = {
            title: data.newTitle,
            nodes: data.nodes,
            edges: data.edges
        };
        const workflow = await WorkflowModel.findByIdAndUpdate(req.params.workflowId, updateData, {new:true});
        if(!workflow || workflow.userId.toString() !== req.userId){
            return res.status(400).json({
                message: "Workflow not found"
            })
        }
        return res.status(200).json({
            message: "Workflow Updated",
            id: workflow._id
        })
    }
    catch(e){
        return res.status(500).json({
            message: "Internal Server Error",
            error: e
        })
    }
})

app.get("/workflow/:workflowId", authMiddleware, async (req, res)=>{
    const workflow = await WorkflowModel.findById(req.params.workflowId);
    if(!workflow || workflow.userId.toString()!==req.userId){
        return res.status(404).json({
            message: "Workflow Not Found"
        })
    }
    return res.status(200).json(workflow)
})

app.get("/workflow/executions/:workflowId", authMiddleware, async (req, res)=>{
    const executions = await ExecutionsModel.find({workflowId: req.params.workflowId});
    if(!executions){
        return res.status(404).json({
            message: "Execution Log Not Found"
        })
    }
    return res.status(200).json(executions)
})

app.get("/nodes", authMiddleware, async (req, res)=>{
    const nodes = await NodesModel.find();
    return res.status(200).json(nodes)
})

app.get("/workflows", authMiddleware, async(req, res)=>{
    const workflows = await WorkflowModel.find({userId: req.userId});
    // console.log(workflows)
    return res.status(200).json(workflows)
})

// app.post("/credentials", (req, res)=>{

// })

// app.get("/credentials", (req,res)=>{

// })

app.listen(process.env.PORT||3000)