import express from "express"
import runGraph from "./ai/grapg.ai.js"

const app = express()

// Enable JSON request body parsing
app.use(express.json())

// Health check route - prevents automated checks from triggering expensive LLM runs
app.get("/", (req, res) => {
    res.json({ status: "healthy", message: "AI Battle Arena Backend is running" })
})

// Battle API endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const { problem, modelA, modelB } = req.body
        if (!problem) {
            return res.status(400).json({ error: "Property 'problem' is required in request body" })
        }
        
        const selectedModelA = modelA || "mistral"
        const selectedModelB = modelB || "cohere"
        
        console.log(`Starting AI Battle between ${selectedModelA} and ${selectedModelB} for query: "${problem}"`)
        const result = await runGraph(problem, selectedModelA, selectedModelB)
        
        res.json({
            ...result,
            modelA: selectedModelA,
            modelB: selectedModelB
        })
    } catch (error: any) {
        console.error("Error executing battle graph:", error)
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message || error 
        })
    }
})

export default app