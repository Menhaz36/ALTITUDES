import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    // Look for token in 'Authorization' header (Format: Bearer <token>)
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Add user info to the request object
        next(); // Move to the next function (the controller)
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};