import { Conversation } from "../Models/ConversationSchema.js";
import OpenAI from "openai";

const generateAIText = async (userId, userPrompt, conversationId) => {
    try {
        const openai = new OpenAI({ apiKey: "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"});
        const previousMessages = await Conversation.findOne({ conversationId: conversationId },{ 'messages._id': 0 }).lean();
        const messages = previousMessages?.messages || [];
        messages.push({
            role: "user",
            content: userPrompt,
        });
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: messages,
        });
        const generatedText = completion.choices[0].message.content;
        const generatedTextRole = completion.choices[0].message.role;
        messages.push({
            role: generatedTextRole,
            content: generatedText,
        });
        await Conversation.updateOne({ conversationId: conversationId }, { messages: messages });
        return generatedText;
    } catch (error) {
        console.error("An Error Occurred:", error);
        throw error; // Rethrow the error for higher-level error handling
    }
};

export default generateAIText;
