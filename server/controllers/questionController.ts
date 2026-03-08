import { Request, Response } from "express";
import db from "../config/database.ts";

interface AuthRequest extends Request {
  user?: any;
}

export const saveQuestions = async (req: AuthRequest, res: Response) => {
  const { extractedSkills, difficulty, questionType, questionCount, questions } = req.body;

  if (!extractedSkills || !difficulty || !questionType || !questionCount || !questions) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    // Save to history
    const result = db.prepare(
      "INSERT INTO question_history (userId, extractedSkills, difficulty, questionType, questionCount, questions) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      req.user.id,
      JSON.stringify(extractedSkills),
      difficulty,
      questionType,
      questionCount,
      JSON.stringify(questions)
    );

    res.status(201).json({
      success: true,
      historyId: result.lastInsertRowid,
      questions,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
