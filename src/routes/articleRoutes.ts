import express, { Router } from "express";
import { createArticle, deleteArticle } from "../controllers/articleController";
import { verifyJWT } from "../middlewares/verifyJWT";

// Create a router instance
const router: Router = express.Router();
router.post("/", verifyJWT, createArticle);
router.delete("/:slug", verifyJWT, deleteArticle);

export default router;
