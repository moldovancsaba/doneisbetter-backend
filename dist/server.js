"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/doneisbetter?retryWrites=true&w=majority&appName=doneisbetter";
// ✅ Connect to MongoDB
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Message Schema
const messageSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose_1.default.model("Message", messageSchema);
// ✅ POST Route (Store Message)
app.post("/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ error: "Message text is required" });
            return;
        }
        const newMessage = new Message({ text });
        yield newMessage.save();
        res.status(201).json({ message: "Message stored", text: newMessage.text });
    }
    catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message" });
    }
}));
// ✅ GET Route (Retrieve Messages)
app.get("/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message.find().sort({ timestamp: -1 }).limit(10);
        res.json(messages);
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// ✅ Default Route
app.get("/", (req, res) => {
    res.send("✅ Server is running.");
});
