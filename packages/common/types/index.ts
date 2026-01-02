import {z}  from "zod";

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const CreateWorkflowSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({
        type: z.string(),
        data: z.object({
            kind: z.enum(['ACTION', 'TRIGGER']),
            metadata:z.any()
        }),
        id: z.string(),
        position: z.object({
            x: z.number(),
            y: z.number()
        }),
        credentials: z.any()
    })),

    edges: z.array(z.object({
        id:z.string(),
        source:z.string(),
        target:z.string()
    }))
})

export const UpdateWorkflowSchema = z.object({
    title: z.string().optional(),
    nodes: z.array(z.object({
        nodeId: z.string(),
        data: z.object({
            kind: z.enum(['ACTION', 'TRIGGER']),
            metadata:z.any()
        }),
        id: z.string(),
        position: z.object({
            x: z.number(),
            y: z.number()
        }),
        credentials: z.any()
    })),

    edges: z.array(z.object({
        id:z.string(),
        source:z.string(),
        target:z.string()
    }))
})

