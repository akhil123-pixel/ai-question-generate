# AI Interview Question Generator

A full-stack web application that leverages Google's Gemini AI to automatically extract skills from resumes and generate tailored interview questions.

## Features

- **Resume Parsing**: Upload a resume (PDF/DOCX) and automatically extract key technical and soft skills.
- **AI Question Generation**: Generate customized interview questions based on the extracted skills, difficulty level, and question type.
- **Interview History**: Save and review past interview question sets.
- **Export**: Export generated questions as PDFs.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`)

## Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akhil123-pixel/ai-question-generator.git
   cd ai-question-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and replace the placeholder API key with your actual Gemini API key.*

4. **Run the application:**
   The project uses a single command to run both the Vite frontend and Node backend. 
   *(Note for Windows users: Because of Vite HMR issues, the system builds the frontend first and runs the backend in production mode to serve it smoothly).*
   ```bash
   npm run build
   $env:NODE_ENV="production"
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Starts the backend server and frontend (depending on `NODE_ENV`).
- `npm run build` - Builds the frontend for production using Vite.
- `npm run clean` - Cleans the `dist` directory.

## License

MIT
