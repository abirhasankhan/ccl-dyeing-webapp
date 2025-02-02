// File: src/controllers/user.controller.js
import { db } from "../config/drizzleSetup.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../models/users.model.js";
import { eq, or } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const SECRET_KEY = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 3600000, // 1 hour
};

// **Register User**
export const registerUser = asyncHandler(async (req, res) => {
    if (!req.body) throw new ApiError(400, "Request body is missing");

    const { name, username, email, password, role, status } = req.body;

    // Validation
    if (password.trim().length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // Check existing users
    const [existingEmail, existingUsername] = await Promise.all([
        db.select().from(users).where(eq(users.email, email)),
        db.select().from(users).where(eq(users.username, username)),
    ]);

    if (existingUsername.length > 0) throw new ApiError(400, `Username ${username} exists`);
    if (existingEmail.length > 0) throw new ApiError(400, `Email ${email} exists`);

    // Create user
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const newUser = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: role || "user",
        status: status || "active",
    };

    const result = await db.insert(users).values(newUser).returning();
    if (!result.length) throw new ApiError(500, "Failed to create user");

    // Generate token
    let token;
    try {
        token = jwt.sign(
            { userId: result[0].userid, role: result[0].role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }

    // Respond
    const { password: _, ...userData } = result[0];
    return res
        .status(201)
        .cookie("token", token, COOKIE_OPTIONS)
        .json(new ApiResponse(201, userData, "User registered"));
});

// **Login User**
export const loginUser = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }
    
    const { email, username, password } = req.body;
    const loginField = email || username;

    if (!loginField || !password) throw new ApiError(400, "Credentials required");

    // Find user using OR condition
    const user = await db
        .select()
        .from(users)
        .where(or(eq(users.email, loginField), eq(users.username, loginField)));

    if (user.length === 0) throw new ApiError(401, "Invalid credentials");

    // Verify password
    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) throw new ApiError(401, "Invalid credentials");

    // Generate token
    let token;
    try {
        token = jwt.sign(
            { userId: user[0].userid, role: user[0].role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }

    // Respond
    return res
        .status(200)
        .cookie("token", token, COOKIE_OPTIONS)
        .json(new ApiResponse(200, {
            userId: user[0].userid,
            name: user[0].name,
            role: user[0].role
        }, "Login successful"));
});

// **Logout User**
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("token", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Logged out"));
});

// **Get Current User**
export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    // Fetch user data from DB
    const user = await db
        .select()
        .from(users)
        .where(eq(users.userid, req.user.userId));

    if (user.length === 0) {
        throw new ApiError(404, "User not found");
    }

    const { password: _, ...userData } = user[0];

    return res.status(200).json(new ApiResponse(200, userData, "User details fetched"));
});

// **Refresh Token**
export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        throw new ApiError(401, 'No token provided');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const newToken = jwt.sign(
            { userId: decoded.userId, role: decoded.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', newToken, COOKIE_OPTIONS)
            .json(new ApiResponse(200, {}, 'Token refreshed'));

    } catch (error) {
        throw new ApiError(401, 'Invalid token');
    }
});
