import { Conversation } from "../Models/ConversationSchema.js";
import OpenAI from "openai";

const generateAIText = async (userId, userPrompt, conversationId) => {
    try {
        // Create an instance of the OpenAI API client with your API key
        const openai = new OpenAI({ apiKey: "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" });
        // Fetch previous messages for the specific user from MongoDB and exclude _id field
        const previousMessages = await Conversation.findOne({ conversationId: conversationId },{ 'messages._id': 0 }).lean();
        // Extract the messages array from the previousMessages document
        const messages = previousMessages?.messages || [];
        // Add the user's new message to the messages array
        messages.push({
            role: "user",
            content: userPrompt,
        });
        // Use the OpenAI API to generate a response based on the messages
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: messages,
        });
        // Extract the generated text from the API response
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
