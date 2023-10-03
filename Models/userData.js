import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userEmail : {
            type : String,
            required : true
        },

        userPassWord : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
);

export const User = mongoose.model("user", userSchema);