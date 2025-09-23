import { Router } from "express";
import { handleFileUpload, getAllUploads, deleteUpload } from "../controllers/upload.controller.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/", upload.single("file"), handleFileUpload);

router.get("/", getAllUploads);

router.delete("/:id", deleteUpload);

export default router;
