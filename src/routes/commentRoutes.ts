import express, { Router } from "express";
import { addCommentsToArticle } from "../controllers/CommentController";
import { verifyJWT } from "../middlewares/verifyJWT";

const router: Router = express.Router();

router.post("/:slug/comments", verifyJWT, addCommentsToArticle);

export default router;
