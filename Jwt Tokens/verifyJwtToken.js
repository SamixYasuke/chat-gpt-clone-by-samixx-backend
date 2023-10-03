import jwt from "jsonwebtoken";

const VerifyJwtToken = (req, res, next) => {
    const token = req.headers.authorization;
    // Check if the token exists
    if (!token) {
        return res.status(401).json(
            { 
                error: "Unauthorized: No token provided" 
            }
        );
    }
    // Verify the token
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), "abdn8379130891chvjfvuCUIVY");
        // Attach the decoded payload (e.g., user ID) to the request for later use
        req.userId = decoded.userId;
        req.userEmail = decoded.userEmail;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

// Export the middleware function
export default VerifyJwtToken;