import "dotenv/config";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { redis } from "../lib/redis.js";

// Generate Access & Refresh Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

// Store Refresh Token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, {
    ex: 7 * 24 * 60 * 60, // 7 days
  });
};

// Set Authentication Cookies
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// =========================
// 1) Signup
// =========================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in Redis
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    // Send response
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Login
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    await storeRefreshToken(user._id.toString(), refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// =========================
// 2) Logout
// =========================
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Delete refresh token from Redis
    await redis.del(`refresh_token:${decoded.userId}`);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }

};


// =========================
// 2) this will be used to refresh the access token using the refresh token
// =========================
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found",
      });
    }

    // Verify refresh token
    // check if it real toke come from use cookies not fake
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Check if the refresh token exists in Redis
    const storedRefreshToken = await redis.get(
      `refresh_token:${decoded.userId}`
    );

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId
    );

    // Store new refresh token in Redis
    await storeRefreshToken(decoded.userId, newRefreshToken);

    // Set cookies
    setCookies(res, accessToken, newRefreshToken);

    res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// =========================
// 4) Get Profile
// =========================
export const getProfile = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};