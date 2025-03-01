"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model("Message", messageSchema);
