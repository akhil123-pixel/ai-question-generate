import express from "express";
import { saveQuestions } from "../controllers/questionController.ts";
import { protect } from "../middleware/auth.ts";

const router = express.Router();

router.post("/save", protect, saveQuestions);

export default router;
