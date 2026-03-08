import mongoose from "mongoose";

const QuestionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  extractedSkills: { type: [String], required: true },
  difficulty: { type: String, required: true },
  questionType: { type: String, required: true },
  questionCount: { type: Number, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      key_points: { type: [String], required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QuestionHistory", QuestionHistorySchema);
