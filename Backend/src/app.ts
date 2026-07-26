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
        const { problem } = req.body
        if (!problem) {
            return res.status(400).json({ error: "Property 'problem' is required in request body" })
        }
        
        console.log(`Starting AI Battle for query: "${problem}"`)
        const result = await runGraph(problem)
        res.json(result)
    } catch (error) {
        console.error("Error executing battle graph:", error)
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message || error 
        })
    }
})

export default app