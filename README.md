# ✍️ EvalCraft • Student Verbal Evaluation Assistant for Teachers

An AI-powered, high-efficiency web tool designed to help teachers write personalized, balanced, and encouraging student verbal evaluations (*slovní hodnocení* / report card narrative comments) in seconds.

Built with **React**, **Vite**, and **Google Gemini 2.0 Flash**. Completely static, zero backend required, and ready to deploy to **GitHub Pages**.

---

## 🌟 Key Features

1. **Student Profile & Identity**:
   - Student First & Last Name
   - Subject selection (English, Math, Science, Social Studies, Art, PE, Homeroom, or Custom)
   - Overall Grade / Performance Level
   - Word limit target slider (50 to 250 words) with real-time word counting

2. **5 Pedagogical Evaluation Pillars (Interactive 1-to-5 Selectors)**:
   - 📚 **Academic Understanding & Concept Mastery**
   - ⚡ **Effort & Work Ethic / Preparation**
   - 🙋 **Classroom Engagement & Participation**
   - 🤝 **Social, Teamwork & Conduct**
   - 📈 **Growth & Trajectory over the term**
   - Clickable observation tag chips underneath each category for rapid context addition.

3. **Keyword Input Fields**:
   - ⭐ **Key Strengths & Advantages** (type and press Enter or comma)
   - 🌱 **Areas for Growth & Challenges**
   - 🎯 **Actionable Next-Step Goals** for the upcoming semester

4. **One-Click Polish & Refinements**:
   - 🤏 *Make 25% Shorter*
   - 🌟 *More Encouraging*
   - 🎯 *Sharpen Actionable Next Steps*
   - 🔄 *Fresh Rephrase*

5. **Teacher Productivity Workflow**:
   - 📋 *1-Click Copy to Clipboard*
   - 💾 *Evaluated Students Queue / History Tray* (persisted in browser `localStorage`)
   - ➡️ *Next Student Button* (clears name and notes while keeping subject & word limit presets)
   - 🌙 *Dark & Light Mode* support
   - 🧪 *Demo Mode* (works immediately even without an API key)

---

## 🚀 Running Locally

```bash
# Navigate to the project
cd Tools/StudentEvalGenerator

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🌐 Deploying to GitHub Pages (1-Click)

The repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Initialize a git repository and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of EvalCraft"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push to `main` and your app will be automatically published at `https://<your-username>.github.io/<your-repo-name>/`!

---

## 🔑 Getting a Free Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with any Google account and click **Create API Key**.
3. In EvalCraft, click **⚙️ Settings** in the top right corner and paste your key.
4. Your API key is stored strictly inside your browser's private `localStorage` and never leaves your device.
