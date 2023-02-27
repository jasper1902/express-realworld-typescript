import express, { Router } from "express";
import {
  createArticle,
  deleteArticle,
  favoriteArticle,
  feedArticles,
  getArticleWithSlug,
  listArticles,
  unfavoriteArticle,
  updateArticle,
} from "../controllers/articleController";
import { verifyJWT } from "../middlewares/verifyJWT";
import { verifyJWTOptional } from "../middlewares/verifyJWTOptional";

// Create a router instance
const router: Router = express.Router();
router.get("/feed", verifyJWT, feedArticles);
router.get('/', verifyJWTOptional, listArticles);
router.post("/", verifyJWT, createArticle);
router.delete("/:slug", verifyJWT, deleteArticle);
router.post("/:slug/favorite", verifyJWT, favoriteArticle);
router.delete("/:slug/favorite", verifyJWT, unfavoriteArticle);
router.get("/:slug", getArticleWithSlug);
router.put("/:slug", verifyJWT, updateArticle);

export default router;
