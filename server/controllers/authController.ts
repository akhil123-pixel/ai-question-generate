import { Request, Response } from "express";
import db from "../config/database.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id: string | number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = db.prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
    ).run(name, email, hashedPassword, role || "student");

    if (result.lastInsertRowid) {
      res.status(201).json({
        _id: result.lastInsertRowid,
        name,
        email,
        role: role || "student",
        isNewUser: true,
        token: generateToken(result.lastInsertRowid),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
