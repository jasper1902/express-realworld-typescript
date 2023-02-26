import express, { Router } from "express";
import {
  createArticle,
  deleteArticle,
  favoriteArticle,
  getArticleWithSlug,
  unfavoriteArticle,
  updateArticle,
} from "../controllers/articleController";
import { verifyJWT } from "../middlewares/verifyJWT";

// Create a router instance
const router: Router = express.Router();
router.post("/", verifyJWT, createArticle);
router.delete("/:slug", verifyJWT, deleteArticle);
router.post("/:slug/favorite", verifyJWT, favoriteArticle);
router.delete("/:slug/favorite", verifyJWT, unfavoriteArticle);
router.get("/:slug", getArticleWithSlug);
router.put("/:slug", verifyJWT, updateArticle);

export default router;
