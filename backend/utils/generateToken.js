import jwt from "jsonwebtoken";

/**
 * Generates a JWT token and sets it as a cookie on the response object
 * @function
 * @param {string} userId - The user ID to be signed in the JWT token
 * @param {Object} res - The response object
 * @returns {void}
 */
const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "30d",
    })

    res.cookie("jwt", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV!=="development",
    })
}

export default generateTokenAndSetCookie