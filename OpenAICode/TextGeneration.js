import { Conversation } from "../Models/ConversationSchema.js";
import OpenAI from "openai";

const generateAIText = async (userId, userPrompt, conversationId) => {
    try {
        const openai = new OpenAI({ apiKey: "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" });
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
        // Store the system-generated message in the messages array
        messages.push({
            role: generatedTextRole,
            content: generatedText,
        });
        // Update the messages array in the conversation document
        await Conversation.updateOne({ conversationId: conversationId }, { messages: messages });
        // Return the generated text as the result
        return generatedText;
    } catch (error) {
        console.error("An Error Occurred:", error);
        throw error; // Rethrow the error for higher-level error handling
    }
};

export default generateAIText;
