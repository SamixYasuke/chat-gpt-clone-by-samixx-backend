import jwt from "jsonwebtoken";

const generateAuthToken = (user)=>{
    const secretKey = 'abdn8379130891chvjfvuCUIVY';
    const payload = {
        userId: user._id,
        userEmail : user.userEmail
    };
    const options = {
        expiresIn: '72h'
    };
    const token = jwt.sign(payload, secretKey, options);
    return token;
}

export default generateAuthToken;
