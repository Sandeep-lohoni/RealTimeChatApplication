import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
/**
 * Protects a route by verifying the JWT token sent in the request cookies.
 * If the token is invalid, or the user is not found, a 401 Unauthorized response is sent.
 * If a valid token is found, the user is found and attached to the request object as req.user
 * and the next() function is called.
 **/
const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export default protectRoute;