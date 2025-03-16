import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import SVGRoute from "./routes/svg.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/", SVGRoute);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dummy Node.js Project!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
