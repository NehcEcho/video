import express from "express";
import cors from "cors";
import bilibiliRouter from "./routes/bilibili.js";

const app = express();
const PORT = process.env.PORT || 1658;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api", bilibiliRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
