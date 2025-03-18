
import express from "express";
import multer from "multer";
import { createCanvas, Image } from "canvas";
import sharp from "sharp";

const router = express.Router();
const upload = multer(); // Multer for handling file uploads

const writeFileAsync = promisify(fs.writeFile);
// router.post("/convert", upload.single("file"), async (req, res) => {
//   try {
//     const { format, height, width } = req.body;
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const fileBuffer = req.file.buffer;
//     let outputBuffer;

//     if (format === "svg") {
//       // Convert image to SVG using Canvas
//       const img = new Image();
//       img.src = fileBuffer;

//       const canvasWidth = Number(width) || img.width;
//       const canvasHeight = Number(height) || img.height;
//       const canvas = createCanvas(canvasWidth, canvasHeight, "svg");
//       const ctx = canvas.getContext("2d");

//       ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
//       outputBuffer = Buffer.from(canvas.toBuffer("utf8"));
//     } else if (format === "pdf") {
//       // Convert image to PDF using pdf-lib

//       const pngBuffer = await sharp(fileBuffer).toFormat("png").toBuffer();
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage([Number(width) || 600, Number(height) || 800]);
//       const image = await pdfDoc.embedPng(pngBuffer); // Works with PNG or JPEG
//       page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });

//       outputBuffer = await pdfDoc.save();
//     } else {
//       return res.status(400).json({ error: "Invalid format. Supported: svg, pdf" });
//     }

//     // Convert output to Base64
//     const base64data = outputBuffer.toString("base64");

//     res.json({ data: base64data });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Something went wrong!" });
//   }
// });

// export default router;



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
    ctx.drawImage(img, 0, 0);

    const fileBufferSVG = canvas.toBuffer(); // Convert to SVG
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