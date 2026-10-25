import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.unsigned_upload(
      dataURI,
      "ml_default",
    );
    res.json({ url: result.secure_url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// uploadRouter.post("/", auth, upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         message: "No image file provided",
//       });
//     }

//     if (!req.file.mimetype.startsWith("image/")) {
//       return res.status(400).json({
//         message: "Only image files are allowed",
//       });
//     }

//     const result = await cloudinary.uploader.upload(
//       `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
//       {
//         folder: "Grocery-Delivery",
//         resource_type: "image",
//       },
//     );

//     return res.status(200).json({
//       url: result.secure_url,
//       publicId: result.public_id,
//     });
//   } catch (error: any) {
//     console.error("Cloudinary upload error:", error);
//     console.error("HTTP status:", error.http_code);
//     console.error("Cloudinary message:", error.message);
//     console.error("Cloudinary details:", error.error);

//     return res.status(error.http_code || 500).json({
//       message: error.message || "Image upload failed",
//       status: error.http_code || 500,
//     });
//   }
// });

export default uploadRouter;
