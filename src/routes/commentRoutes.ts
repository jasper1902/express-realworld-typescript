import express, { Router } from "express";
import {
  addCommentsToArticle,
  deleteCommentFromArticle,
  getCommentsFromArticle,
} from "../controllers/commentController";

import { verifyJWT } from "../middlewares/verifyJWT";
import { verifyJWTOptional } from "../middlewares/verifyJWTOptional";

const router: Router = express.Router();

router.post("/:slug/comments", verifyJWT, addCommentsToArticle);
router.get("/:slug/comments", verifyJWTOptional, getCommentsFromArticle);
router.delete("/:slug/comments/:id", verifyJWT, deleteCommentFromArticle);

export default router;
