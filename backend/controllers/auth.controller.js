import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSerCookie from "../utils/generateToken.js";

/**
 * Handles creating a new user
 * Checks if the passwords match
 * Checks if the user already exists
 * Hashes the password
 * Creates a new user
 * Generates a jwt token
 * Sets the token as a cookie
 * Saves the user and returns a json response with the user's data
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise} A promise that resolves to a json response with the user's data
 */
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword) return res.status(400).json({ error: "Passwords don't match" });

        const user = await User.findOne({ username });

        if (user) return res.status(400).json({ error: "Username already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = await User({
            fullName,
            username,
            password: hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        if(newUser){
            // generate jwt token
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic,
            });
        }
        else{
            res.status(400).json({ error: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup contoller: ", error.message);
        res.status(500).json({ error:"InternalServer Error" });
    }

};

        /**
         * Handles logging in a user
         * Checks if the user exists
         * Checks if the password is correct
         * Generates a jwt token
         * Sets the token as a cookie
         * Saves the user and returns a json response with the user's data
         * @param {Object} req - The request object
         * @param {Object} res - The response object
         * @returns {Promise} A promise that resolves to a json response with the user's data
         */
export const login = async(req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        const ispasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !ispasswordCorrect){
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSerCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

        /**
         * Handles logging out a user
         * Deletes the jwt cookie
         * Returns a success message and status code
         * @param {Object} req - The request object
         * @param {Object} res - The response object
         * @returns {Promise} A promise that resolves to a json response with a success message
         */
export const logout = async(req, res) => {
    try {
        res.cookie("jwt", "",{maxAge: 0});
        res.status(200).json({ message: "User logged out successfully" });

    } catch (error) {
        console.log("Error in logout controller ", error);
        res.status(500).json({ error:"Server error" });
    }
};