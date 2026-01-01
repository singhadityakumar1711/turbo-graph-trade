import { password } from "bun";
import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required: true
    }
});

const EdgesSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    source: {
        type:String,
        required:true
    },
    target:{
        type:String,
        required:true
    }
}, {_id:false})

const PositionSchema = new Schema({
    x:{
        type:Number,
        required:true
    },
    y:{
        type:Number,
        required:true
    }
}, {_id:false})

const NodeDataSchema = new Schema({
    kind:{
        type:String,
        enum: ['ACTION', 'TRIGGER'],
        required:true
    },
    metadata:{
        type:Schema.Types.Mixed,
        required:true
    }
}, {_id:false})

const WorkflowNodesSchema = new Schema({
    nodeId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref: "Nodes"
    },
    data: NodeDataSchema,
    id: {
        type:String,
        required:true
    },
    position: PositionSchema,
    credentials: Schema.Types.Mixed
}, {_id:false})

const WorkflowSchema = new Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        required:true,
        ref: 'Users'
    },
    title: {
        type:String,
        required:true
    },
    nodes: [WorkflowNodesSchema],
    edges:[EdgesSchema]
});

const CredentialsTypeSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    required:{
        type: Boolean,
        required:true
    }
}, {_id:false})

const NodesSchema = new Schema({
    title:{
        type:String,
        required:true   
    },
    description:{
        type: String,
        required:true
    },
    type:{
        type: String,
        enum: ['ACTION', 'TRIGGER'],
        required:true
    },
    credentialsType: [CredentialsTypeSchema]
});

const ExecutionsSchema = new Schema({
    workflowId:{
        type: mongoose.Types.ObjectId,
        required:true,
        ref:'Workflows'
    },
    status:{
        type:String,
        required:true
    },
    startTime:{
        type:Date,
        default:Date.now()
    },
    endTime:{
        type:Date
    }
})



export const UserModel = mongoose.model("Users", UserSchema);
export const WorkflowModel = mongoose.model("Workflows", WorkflowSchema);
export const NodesModel = mongoose.model("Nodes", NodesSchema);
export const ExecutionsModel = mongoose.model("Executions", ExecutionsSchema);