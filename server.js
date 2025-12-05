import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ES module için __dirname tanımı
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // static dosyalar (css/js/img vs.)

// Ana sayfa
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// health check (UptimeRobot için)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.json({ error: "Message is required" });
    }

    const OPENAI_KEY = process.env.OPENAI_KEY;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Reply shortly." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await r.json();

    const reply = data.choices?.[0]?.message?.content || "No response.";

    res.json({ reply });

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
