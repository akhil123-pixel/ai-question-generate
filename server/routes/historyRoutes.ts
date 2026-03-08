import express from "express";
import { getHistory, getHistoryById, deleteHistory } from "../controllers/historyController.ts";
import { protect } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", protect, getHistory);
router.get("/:id", protect, getHistoryById);
router.delete("/:id", protect, deleteHistory);

export default router;
