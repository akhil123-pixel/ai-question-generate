import { Request, Response } from "express";
import { extractTextFromFile } from "../services/resumeService.ts";
import fs from "fs";

export const uploadResume = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract text from file
    const text = await extractTextFromFile(filePath, mimeType);

    // Optional: Clean up uploaded file after processing
    // fs.unlinkSync(filePath);

    res.json({
      success: true,
      extractedText: text,
      fileName: req.file.originalname,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
