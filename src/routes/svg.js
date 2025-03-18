import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createCanvas, Image } from "canvas";
import fs from "fs";
import { promisify } from "util";

const router = express.Router();
const upload = multer(); // Multer for handling file uploads
const writeFileAsync = promisify(fs.writeFile);

router.post("/convert", upload.single("file"), async (req, res) => {
  try {
    const { format, height, width } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const fileBuffer = req.file.buffer;
    
    let outputBuffer;

    if (format === "svg") {
      // Convert PNG to SVG
      const img = new Image();
      img.src = fileBuffer;

      const canvas = createCanvas(Number(width) || img.width, Number(height) || img.height, "svg");
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      outputBuffer = Buffer.from(canvas.toBuffer("utf8"));
    } else if (format === "pdf") {
      // Convert PNG to PDF using Sharp
      outputBuffer = await sharp(fileBuffer)
        .resize(Number(width) || undefined, Number(height) || undefined)
        .toFormat("pdf")
        .toBuffer();
    } else {
      return res.status(400).json({ error: "Invalid format. Supported: svg, pdf" });
    }

    // Convert output to Base64
    const base64data = outputBuffer.toString("base64");

    res.json({ data: base64data });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

export default router;


// import express from "express";
// import multer from "multer";
// import { createCanvas, Image } from "canvas";
// import sharp from "sharp";

// const router = express.Router();
// const upload = multer(); // Multer for handling file uploads

// router.post("/convert", upload.single("file"), async (req, res) => {
//   try {
//     const { format, height, width } = req.body;
//     const fileBuffer = req.file.buffer; 

//     if (!fileBuffer) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const pngBuffer = await sharp(fileBuffer).toFormat("png").toBuffer();

//     const img = new Image();
//     img.src = pngBuffer;

//     const canvas = createCanvas(Number(width) || img.width, Number(height) || img.height, format);
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0);

//     const fileBufferSVG = canvas.toBuffer(); // Convert to SVG
//     const base64data = Buffer.from(fileBufferSVG).toString("base64");

//     res.json({ data: base64data });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Something went wrong!" });
//   }
// });

//   async function readFileAsArrayBuffer(file) {
//     return await file.arrayBuffer();
//   }

//   export default router;