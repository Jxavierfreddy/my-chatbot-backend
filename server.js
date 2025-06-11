const express = require("express");
const bodyParser = require("body-parser");
const { execFile } = require("child_process");
const cliPath = path.join(__dirname, "ALParserCLI.exe");

execFile(cliPath, [`--query=${question}`, `--path=./al-files`], ...);

const app = express();
app.use(bodyParser.json());

app.post("/ask", (req, res) => {
  const question = req.body.question;

  execFile("dotnet", [
    "run",
    "--project",
    "../ALObjectParser/ALParserCLI",  // Adjust if different path
    `--query=${question}`,
    `--path=../ALObjectParser/test-al-files` // Folder with .al files
  ], (error, stdout, stderr) => {
    if (error) {
      console.error("Parser error:", error);
      return res.status(500).send({ error: "Parser failed." });
    }

    try {
      const parsed = JSON.parse(stdout);
      const reply = parsed.map(o => `🔹 ${o.Type} ${o.Name}\n${o.Procedures.map(p => `  • ${p.Name}: ${p.Documentation}`).join("\n")}`).join("\n\n");
      res.send({ answer: reply || "No matches found." });
    } catch (e) {
      res.status(500).send({ error: "Invalid parser output." });
    }
  });
});

app.listen(3000, () => {
  console.log("🚀 AL Parser API running at http://localhost:3000");
});
