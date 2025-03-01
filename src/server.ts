import express, { Request, Response, Application } from "express";
import mongoose from "mongoose";
import cors from "cors";

const app: Application = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/doneisbetter?retryWrites=true&w=majority&appName=doneisbetter";

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use(cors());
app.use(express.json());

// ✅ Message Schema
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// ✅ POST Route (Store Message)
app.post("/messages", async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: "Message text is required" }); return; } 

    const newMessage = new Message({ text });
    await newMessage.save();
    res.status(201).json({ message: "Message stored", text: newMessage.text });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// ✅ GET Route (Retrieve Messages)
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
