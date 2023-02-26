import User from "../models/User";
import Article from "../models/Article";
import { RequestHandler } from "express";
import { JWTNewRequest } from "./profileController";
import slugify from "slugify";

export const createArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;
    console.log(id);

    const author = await User.findById(id);

    if (!author) {
      return res.status(401).json({ message: "User not found" });
    }

    const { title, description, body, tagList } = req.body.article;

    if (!title || !description || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const slug = slugify(title, { lower: true, replacement: "-" });

    const existingSlug = await Article.findOne({ slug }).exec();
    if (existingSlug) {
      return res.status(400).json({ message: "Article already exists" });
    }

    const article = await Article.create({ title, description, body, slug });
    article.author = author._id;

    if (Array.isArray(tagList) && tagList.length > 0) {
      article.tagList = tagList;
    }

    await article.save();

    await res.status(201).json({
      article: await article.toArticleResponse(author),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;

    const slug = req.params.slug;

    const loginUser = await User.findById(id);

    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.author.toString() === loginUser._id.toString()) {
      await Article.deleteOne({ slug });
      res.status(200).json({
        message: "Article successfully deleted!!!",
      });
    } else {
      res.status(403).json({
        message: "Only the author can delete his article",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const favoriteArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;
    const { slug } = req.params;

    const loginUser = await User.findById(id).exec();

    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await loginUser.favorite(article._id);
    const updatedArticle = await article.updateFavoriteCount();

    return res.status(200).json({
      article: await updatedArticle.toArticleResponse(loginUser),
    });
  } catch (error) {
    next(error);
  }
};

export const unfavoriteArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;
    const { slug } = req.params;

    const loginUser = await User.findById(id).exec();

    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await loginUser.unfavorite(article._id);
    const updatedArticle = await article.updateFavoriteCount();

    return res.status(200).json({
      article: await updatedArticle.toArticleResponse(loginUser),
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleWithSlug: RequestHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      article: await article.toArticleResponse(false),
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;
    const { slug } = req.params;
    const { article } = req.body;

    const loginUser = await User.findById(id).exec();

    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const target = await Article.findOne({ slug }).exec();

    if (loginUser._id.toString() !== target?.author.toString()) {
      return res
        .status(401)
        .json({ message: "You are not allowed to update this article" });
    }

    if (target && article) {
      if (article.title) target.title = article.title;
      if (article.description) target.description = article.description;
      if (article.body) target.body = article.body;

      await target.save();
      res.status(200).json({
        article: await target.toArticleResponse(loginUser),
      });
    } else {
      res.status(404).json({ message: "Article not found" });
    }
  } catch (error) {
    next(error);
  }
};
