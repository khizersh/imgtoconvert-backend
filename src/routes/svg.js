import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createCanvas, Image } from "canvas";
import fs from "fs";
import { promisify } from "util";
import puppeteer from "puppeteer";

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
      // Convert image to SVG using Canvas
      const img = new Image();
      img.src = fileBuffer;

      const canvasWidth = Number(width) || img.width;
      const canvasHeight = Number(height) || img.height;
      const canvas = createCanvas(canvasWidth, canvasHeight, "svg");
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      outputBuffer = Buffer.from(canvas.toBuffer("utf8"));
    } else if (format === "pdf") {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      
      // Convert image to base64
      const fileBase64 = fileBuffer.toString("base64");
      const mimeType = req.file.mimetype;

      // Render the image inside an HTML page for Puppeteer
      await page.setContent(`
        <html>
          <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <img src="data:${mimeType};base64,${fileBase64}" style="max-width:100%; max-height:100%;" />
          </body>
        </html>
      `);

      outputBuffer = await page.pdf({ format: "A4" });

      await browser.close();
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