import express, { json } from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generateAuthToken from "./Jwt Tokens/generateJwtToken.js";
import generateAIText from "./OpenAICode/TextGeneration.js";
import VerifyJwtToken from "./Jwt Tokens/verifyJwtToken.js";
import { User }  from "./Models/userData.js";
import idGenerator from "./Utilities/idGenerator.js";
import { Conversation } from "./Models/ConversationSchema.js";
const app = express();

app.use(cors());
app.use(json());
const PORT = 3000;

app.post("/startConversation", VerifyJwtToken, async (req, res) => {
    try {
        const userID = req.userId; // Get the user's ID from the JWT token
        // Generate a new conversationId as a random string
        const newConversationId = idGenerator(25);
        // Create a new conversation and save it to the database, associating it with the user
        const newConversation = new Conversation({
            conversationId: newConversationId,
            messages: [],
            user: userID, // Associate the conversation with the user
        });
        await newConversation.save();
        res.status(201).json({
            conversationId: newConversationId,
        });
    } catch (error) {
        console.error("An Error Occurred:", error);
        res.status(500).json({
            message: "An Error Occurred. Cannot start a new conversation",
        });
    }
});

// API Route to Get Conversations
app.get("/conversations/:userId", VerifyJwtToken, async (req, res) => {
    try {
        const userID = req.params.userId; // Get the user's ID from the request body
        // Find all conversations associated with the user
        const conversations = await Conversation.find({ user: userID });
        // Check if there are no conversations
        if (conversations.length === 0) {
            return res.status(404).json({
                message: "No conversations found for the user",
            });
        }
        // Return the list of conversations as JSON response
        res.status(200).json(conversations);
    } catch (error) {
        console.error("An Error Occurred:", error);
        res.status(500).json({
            message: "An error occurred while fetching conversations",
        });
    }
});

app.get("/conversation/:userId/:conversationId", VerifyJwtToken, async (req, res) => {
    try {
        const userID = req.params.userId; // Get the user's ID from the request parameters
        const conversationId = req.params.conversationId; // Get the conversation ID from the request parameters
        
        // Find the conversation associated with the user and the specific conversation ID
        const conversation = await Conversation.findOne({ user: userID, conversationId: conversationId });
        
        // Check if the conversation exists
        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found for the user",
            });
        }
        
        // Return the conversation as a JSON response
        res.status(200).json(conversation);
    } catch (error) {
        console.error("An Error Occurred:", error);
        res.status(500).json({
            message: "An error occurred while fetching the conversation",
        });
    }
});


// API Route to Send Messages in a Conversation
app.post("/sendMessage/:conversationId", VerifyJwtToken, async (req, res) => {
    try {
        const userPrompt = req.body.userPrompt;
        const userID = req.userId;
        const conversationId = req.params.conversationId;

        // Debugging: Print the conversationId to check its value
        console.log("Conversation ID:", conversationId);

        // Find the conversation based on conversationId
        const conversation = await Conversation.findOne({ conversationId: conversationId });

        // Debugging: Print the conversation object to check if it's found
        console.log("Conversation:", conversation);

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        // Simulate an AI response (you can replace this with your AI integration)
        const aiResponse = await generateAIText(userID, userPrompt, conversationId);

        // Combine user and AI messages into a single array
        const combinedMessages = [
            ...conversation.messages,
            {
                role: "user",
                content: userPrompt,
            },
            {
                role: "system",
                content: aiResponse,
            }
        ];
        // Update the conversation messages with the new messages
        await Conversation.updateOne({ conversationId: conversationId }, { messages: combinedMessages });
        res.status(201).json({
            message: aiResponse,
            role: "system"
        });
    } catch (error) {
        console.error("An Error Occurred:", error);
        res.status(500).json({
            message: "An Error Occurred. Cannot send message",
        });
    }
});

app.post("/loginuser", async (req, res) => {
    try {
        const userEmail = req.body.userEmail;
        const user = await User.findOne({ userEmail: userEmail });
        if (!user) {
            res.status(404).json({
                message: "User Not Found"
            });
            return;
        }
        const userPassWord = req.body.userPassWord;
        const isPasswordCorrect = await bcrypt.compare(userPassWord, user.userPassWord);
        if (!isPasswordCorrect) {
            res.status(401).json({
                message: "Invalid Password"
            });
            return;
        }
        const token = generateAuthToken(user);
        res.status(200).json({
            message: "Login Successful",
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: "An Error Occurred Couldn't Login"
        });
    }
});


app.post("/registeruser", async(req, res)=>{
    try {
        const userMail = req.body.userEmail;
        const findUser = await User.find({ userEmail : userMail });
        const userExists = (findUser.length > 0) ? true : false;
        if(userExists){
            res.status(400).json({
                message : "This Email Has Already Been Used"
            })
        }else if(!userExists){
            const user = new User({
                userEmail : userMail,
                userPassWord : await bcrypt.hash(req.body.userPassword, 10)
            })
            await user.save();
            res.status(201).json({
                message : "User Registered Successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            message : "An Error Occurred. Couldn't register User"
        });
    }
});

app.delete("/deleteuser", async (req, res) => {
    try {
        const userId = req.body.userId;
        // Use Mongoose to delete the user by ID
        const deletedUser = await User.deleteOne({ _id: userId });
        // Check if a user was deleted
        if (deletedUser.deletedCount === 1) {
            res.status(200).json({
                message: "User deleted successfully",
            });
        } else {
            res.status(404).json({
                message: "User not found",
            });
        }
    } catch (error) {
        console.error("An Error Occurred:", error);
        res.status(500).json({
            message: "An Error Occurred. Cannot delete user",
        });
    }
});

app.get("/getuserdetail", VerifyJwtToken, async(req, res) => {
    try {
        const userId = req.userId;
        const userEmail = req.userEmail;
        const queries = await Conversation.find({
            user : userId
        })
        res.status(200).json(
            { 
                userId : userId,
                userEmail : userEmail
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

const connectServer = async ()=>{
    try {
        await mongoose.connect("mongodb+srv://samueladekolu4:chat-gpt-samixx-samixx@cluster0.fqtqrlz.mongodb.net/ChatGPTClone");
        console.log("Connected to MongoDB Successfully");
        app.listen(PORT, ()=>{
            console.log(`This is active on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB");
    }
}

connectServer();
//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