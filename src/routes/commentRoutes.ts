import express, { Router } from "express";
import {
  addCommentsToArticle,
  getCommentsFromArticle,
} from "../controllers/CommentController";
import { verifyJWT } from "../middlewares/verifyJWT";
import { verifyJWTOptional } from "../middlewares/verifyJWTOptional";

const router: Router = express.Router();

router.post("/:slug/comments", verifyJWT, addCommentsToArticle);
router.get("/:slug/comments", verifyJWTOptional, getCommentsFromArticle);

export default router;
