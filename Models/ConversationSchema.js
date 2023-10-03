import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        unique: true,
        required: true,
    },
    messages: [
        {
            role: String,
            content: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Assuming you have a User model
            },
        },
    ],
    user: {
        type: String, // You can keep it as a String if it represents a user identifier
        required: true,
    },
}, {
    timestamps : true
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
