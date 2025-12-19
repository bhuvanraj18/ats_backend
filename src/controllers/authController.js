import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * REGISTER USER
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: companyId || null
      }
    });

    res.status(201).json({
      message: "User registered successfully",
      id: user.id
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * LOGIN USER
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user using Prisma
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
