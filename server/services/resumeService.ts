import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
import fs from "fs";

export const extractTextFromFile = async (filePath: string, mimeType: string): Promise<string> => {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at path: ${filePath}`);
    throw new Error("Uploaded file could not be found on server.");
  }

  const dataBuffer = fs.readFileSync(filePath);
  console.log(`Read file ${filePath}, size: ${dataBuffer.length} bytes`);

  if (dataBuffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (mimeType === "application/pdf") {
    try {
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      console.log(`Extracted ${result.text.length} characters from PDF`);
      return result.text;
    } catch (e: any) {
      console.error("Error during PDF parsing:", e);
      throw new Error(`Failed to parse PDF: ${e.message}`);
    }
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    console.log(`Extracted ${result.value.length} characters from Word doc`);
    return result.value;
  } else {
    throw new Error("Unsupported file type");
  }
};
