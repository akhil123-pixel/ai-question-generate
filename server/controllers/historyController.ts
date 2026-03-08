import { Request, Response } from "express";
import db from "../config/database.ts";

interface AuthRequest extends Request {
  user?: any;
}

const formatHistory = (history: any) => {
  if (!history) return null;
  return {
    ...history,
    _id: history.id,
    extractedSkills: JSON.parse(history.extractedSkills),
    questions: JSON.parse(history.questions),
  };
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
    const history = db.prepare("SELECT * FROM question_history WHERE userId = ? ORDER BY createdAt DESC").all(userId);
    res.json(history.map(formatHistory));
  } catch (err: any) {
    console.error('Get history error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getHistoryById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const history = db.prepare("SELECT * FROM question_history WHERE id = ? AND userId = ?").get(id, userId);

    if (!history) {
      return res.status(404).json({ message: "History entry not found" });
    }

    res.json(formatHistory(history));
  } catch (err: any) {
    console.error('Get history by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteHistory = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const rawUserId = req.user.id;
    const userId = typeof rawUserId === 'string' ? parseInt(rawUserId) : rawUserId;

    console.log(`[DELETE] Session ID: ${id}, User ID: ${userId}`);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid session ID format" });
    }

    if (isNaN(userId)) {
      return res.status(401).json({ message: "Invalid user session" });
    }

    const result = db.prepare("DELETE FROM question_history WHERE id = ? AND userId = ?").run(id, userId);

    console.log(`[DELETE] Result changes: ${result.changes}`);

    if (result.changes === 0) {
      // Check if it exists at all to give better error
      const exists = db.prepare("SELECT id FROM question_history WHERE id = ?").get(id);
      if (!exists) {
        return res.status(404).json({ message: "This session no longer exists." });
      }
      return res.status(403).json({ message: "You do not have permission to delete this session." });
    }

    res.json({ message: "History entry deleted successfully", id });
  } catch (err: any) {
    console.error('Delete history error:', err);
    res.status(500).json({ message: "Server error during deletion: " + err.message });
  }
};
