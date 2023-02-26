import User from "../models/User";
import Article from "../models/Article";
import { RequestHandler } from "express";
import { JWTNewRequest } from "./profileController";
import slugify from "slugify";
import createHttpError from "http-errors";

export const createArticle: RequestHandler = async (req, res) => {
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

  return await res.status(201).json({
    article: await article.toArticleResponse(author),
  });
};

export const deleteArticle: RequestHandler = async (req, res) => {
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
};

export const favoriteArticle: RequestHandler = async (req, res) => {
  const newReq = req as unknown as JWTNewRequest;
  const id = newReq.userId;
  const { slug } = req.params;

  const loginUser = await User.findById(id).exec();

  if (!loginUser) {
    throw createHttpError(404, "User not found");
  }

  const article = await Article.findOne({ slug }).exec();

  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  await loginUser.favorite(article._id);
  const updatedArticle = await article.updateFavoriteCount();

  return res.status(200).json({
    article: await updatedArticle.toArticleResponse(loginUser),
  });
};

export const unfavoriteArticle: RequestHandler = async (req, res) => {
  const newReq = req as unknown as JWTNewRequest;
  const id = newReq.userId;
  const { slug } = req.params;

  const loginUser = await User.findById(id).exec();

  if (!loginUser) {
    throw createHttpError(404, "User not found");
  }

  const article = await Article.findOne({ slug }).exec();

  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  await loginUser.unfavorite(article._id);
  const updatedArticle = await article.updateFavoriteCount();

  return res.status(200).json({
    article: await updatedArticle.toArticleResponse(loginUser),
  });
};
