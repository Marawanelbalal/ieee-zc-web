import express from "express";
import type { Health } from "@ieee-zc/shared";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  const body: Health = { status: "ok" };
  res.json(body);
});

const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
