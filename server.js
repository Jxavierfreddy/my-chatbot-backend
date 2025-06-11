const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
app.use(bodyParser.json());

// Adjust paths
const cliPath = path.join(__dirname, "ALParserCLI.exe");
const alSourcePath = path.join(__dirname, "../alsource");

app.post("/ask", (req, res) => {
  const question = req.body.question;

  execFile(cliPath, [`--query=${question}`, `--path=${alSourcePath}`], (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Parser execution error:", error);
      return res.status(500).json({ error: "Parser execution failed." });
    }

    try {
      const parsed = JSON.parse(stdout);

      // Format the reply
      const reply = parsed.map(obj =>
        `🔹 ${obj.Type} ${obj.Name}\n` +
        (obj.Procedures || []).map(p => `  • ${p.Name}: ${p.Documentation || 'No docs.'}`).join("\n")
      ).join("\n\n");

      res.json({ answer: reply || "No matches found." });

    } catch (e) {
      console.error("❌ JSON parsing error:", e);
      console.error("Output was:", stdout);
      res.status(500).json({ error: "Invalid parser output." });
    }
  });
});

app.listen(3000, () => {
  console.log("🚀 AL Parser API running at http://localhost:3000");
});
