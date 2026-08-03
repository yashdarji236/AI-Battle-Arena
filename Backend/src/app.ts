import express from "express";
import cors from "cors";
import runGraph from "./ai/grapg.ai.js";
import { connectDB } from "./db/connect.js";
import { ChatModel } from "./db/chat.schema.js";
import config from "./config/config.js";

const app = express();

const allowedOrigins = [
    "https://ai-battle-arena-tan.vercel.app",
    config.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.json({ status: "healthy", message: "AI Battle Arena Backend with MongoDB is running" });
});

// --- REST API ENDPOINTS FOR MONGOBD CHAT STORAGE ---

// 1. Fetch list of all chats (IDs and Titles only for sidebar)
app.get("/api/chats", async (req, res) => {
    try {
        await connectDB();
        const chats = await ChatModel.find({}, "chatId title updatedAt").sort({ updatedAt: -1 });
        const list = chats.map(c => ({
            id: c.chatId,
            title: c.title,
            updatedAt: c.updatedAt
        }));
        res.json(list);
    } catch (error: any) {
        console.error("Error fetching chats list from MongoDB:", error);
        res.status(500).json({ error: "Failed to fetch chats from database", details: error.message });
    }
});

// 2. Fetch full chat messages history for a specific chatId
app.get("/api/chats/:chatId", async (req, res) => {
    try {
        await connectDB();
        const { chatId } = req.params;
        const chat = await ChatModel.findOne({ chatId });
        if (!chat) {
            return res.json({
                id: chatId,
                title: "New AI Battle",
                messages: []
            });
        }
        res.json({
            id: chat.chatId,
            title: chat.title,
            messages: chat.messages,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        });
    } catch (error: any) {
        console.error("Error fetching chat detail from MongoDB:", error);
        res.status(500).json({ error: "Failed to fetch chat details", details: error.message });
    }
});

// 3. Create or update chat in MongoDB
app.post("/api/chats", async (req, res) => {
    try {
        await connectDB();
        const { chatId, title, messages } = req.body;
        if (!chatId) {
            return res.status(400).json({ error: "Property 'chatId' is required" });
        }

        const updated = await ChatModel.findOneAndUpdate(
            { chatId },
            {
                chatId,
                title: title || "New AI Battle",
                messages: messages || []
            },
            { upsert: true, new: true }
        );

        res.json({ id: updated.chatId, title: updated.title, messages: updated.messages });
    } catch (error: any) {
        console.error("Error saving chat in MongoDB:", error);
        res.status(500).json({ error: "Failed to save chat to database", details: error.message });
    }
});

// 4. Update manual preference verdict for a specific message in MongoDB
app.post("/api/chats/:chatId/verdict", async (req, res) => {
    try {
        await connectDB();
        const { chatId } = req.params;
        const { msgIndex, winnerType } = req.body;

        const chat = await ChatModel.findOne({ chatId });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found in database" });
        }

        if (chat.messages && chat.messages[msgIndex]) {
            chat.messages[msgIndex].manualWinner = winnerType;
            chat.markModified("messages");
            await chat.save();
        }

        res.json({ success: true, chatId: chat.chatId, messages: chat.messages });
    } catch (error: any) {
        console.error("Error saving verdict in MongoDB:", error);
        res.status(500).json({ error: "Failed to save verdict to database", details: error.message });
    }
});

// 5. Delete a chat by chatId from MongoDB
app.delete("/api/chats/:chatId", async (req, res) => {
    try {
        await connectDB();
        const { chatId } = req.params;
        await ChatModel.deleteOne({ chatId });
        res.json({ success: true, message: "Chat deleted from MongoDB" });
    } catch (error: any) {
        console.error("Error deleting chat from MongoDB:", error);
        res.status(500).json({ error: "Failed to delete chat", details: error.message });
    }
});

// 6. Clear all chats from MongoDB
app.delete("/api/chats", async (req, res) => {
    try {
        await connectDB();
        await ChatModel.deleteMany({});
        res.json({ success: true, message: "All chats cleared from MongoDB" });
    } catch (error: any) {
        console.error("Error clearing chats from MongoDB:", error);
        res.status(500).json({ error: "Failed to clear chats", details: error.message });
    }
});

// 7. Aggregate Model Victory Stats from MongoDB
app.get("/api/stats", async (req, res) => {
    try {
        await connectDB();
        const chats = await ChatModel.find({});
        const modelStats: Record<string, { wins: number; losses: number; draws: number }> = {};

        chats.forEach(chat => {
            if (Array.isArray(chat.messages)) {
                chat.messages.forEach(msg => {
                    if (msg.role === "assistant" && msg.modelA && msg.modelB && !msg.isError) {
                        const mA = msg.modelA;
                        const mB = msg.modelB;
                        if (!modelStats[mA]) modelStats[mA] = { wins: 0, losses: 0, draws: 0 };
                        if (!modelStats[mB]) modelStats[mB] = { wins: 0, losses: 0, draws: 0 };

                        const winnerType = msg.manualWinner || msg.judgeWinner;
                        if (winnerType === "A") {
                            modelStats[mA].wins += 1;
                            modelStats[mB].losses += 1;
                        } else if (winnerType === "B") {
                            modelStats[mB].wins += 1;
                            modelStats[mA].losses += 1;
                        } else if (winnerType === "both_good" || winnerType === "draw") {
                            modelStats[mA].draws += 1;
                            modelStats[mB].draws += 1;
                        }
                    }
                });
            }
        });

        res.json(modelStats);
    } catch (error: any) {
        console.error("Error fetching aggregated stats from MongoDB:", error);
        res.status(500).json({ error: "Failed to compute stats from database", details: error.message });
    }
});

// 8. Battle API endpoint (Executes Graph & Saves prompt + solutions to MongoDB)
app.post("/api/chat", async (req, res) => {
    try {
        const { problem, modelA, modelB, chatId } = req.body;
        if (!problem) {
            return res.status(400).json({ error: "Property 'problem' is required in request body" });
        }

        const selectedModelA = modelA || "mistral";
        const selectedModelB = modelB || "cohere";

        console.log(`Starting AI Battle between ${selectedModelA} and ${selectedModelB} for query: "${problem}"`);
        const result = await runGraph(problem, selectedModelA, selectedModelB);

        // Determine initial judge winner
        const s1Score = result.judge?.solution_1_score ?? 0;
        const s2Score = result.judge?.solution_2_score ?? 0;
        let judgeWinner = "draw";
        if (s1Score > s2Score) judgeWinner = "A";
        else if (s2Score > s1Score) judgeWinner = "B";

        const responsePayload = {
            ...result,
            modelA: selectedModelA,
            modelB: selectedModelB,
            judgeWinner
        };

        // Save user query and assistant response directly in MongoDB!
        const targetChatId = chatId || `chat_${Date.now()}`;
        try {
            await connectDB();
            const userMsg = { role: "user", content: problem, timestamp: new Date() };
            const assistantMsg = {
                role: "assistant",
                problem,
                modelA: selectedModelA,
                modelB: selectedModelB,
                solution_1: result.solution_1,
                solution_2: result.solution_2,
                judgeWinner,
                judge: result.judge,
                timestamp: new Date()
            };

            const chat = await ChatModel.findOne({ chatId: targetChatId });
            const currentTitle = problem.length > 30 ? `${problem.substring(0, 30)}...` : problem;

            if (chat) {
                chat.messages.push(userMsg as any, assistantMsg as any);
                if (chat.title === "New AI Battle" || !chat.title) {
                    chat.title = currentTitle;
                }
                await chat.save();
                console.log(`✅ Saved battle response to existing MongoDB chat: ${targetChatId}`);
            } else {
                await ChatModel.create({
                    chatId: targetChatId,
                    title: currentTitle,
                    messages: [userMsg, assistantMsg]
                });
                console.log(`✅ Created new MongoDB chat document: ${targetChatId}`);
            }
        } catch (dbErr) {
            console.error("❌ Error persisting chat history in MongoDB:", dbErr);
        }

        res.json({
            ...responsePayload,
            chatId: targetChatId
        });
    } catch (error: any) {
        console.error("Error executing battle graph:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message || error
        });
    }
});

export default app;