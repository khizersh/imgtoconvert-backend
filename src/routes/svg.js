import express from "express";
import multer from "multer";
import { createCanvas, Image } from "canvas";
import sharp from "sharp";

const router = express.Router();
const upload = multer(); // Multer for handling file uploads

router.post("/convert", upload.single("file"), async (req, res) => {
  try {
    const { format, height, width } = req.body;
    const fileBuffer = req.file.buffer; 

    if (!fileBuffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pngBuffer = await sharp(fileBuffer).toFormat("png").toBuffer();

    const img = new Image();
    img.src = pngBuffer;

    const canvas = createCanvas(Number(width) || img.width, Number(height) || img.height, format);
    const ctx = canvas.getContext("2d");
    // ctx.drawImage(img, 0, 0);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, Number(width) || img.width, Number(height) || img.height);

    const fileBufferSVG = canvas.toBuffer(); 
    const base64data = Buffer.from(fileBufferSVG).toString("base64");
    
    res.json({ data: base64data });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

  async function readFileAsArrayBuffer(file) {
    return await file.arrayBuffer();
  }

  export default router;