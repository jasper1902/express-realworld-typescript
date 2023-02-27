import { RequestHandler } from "express";
import Article from "../models/Article";
import User from "../models/User";
import Comment from "../models/Comment";

import { JWTNewRequest } from "./profileController";

export const addCommentsToArticle: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;

    const commenter = await User.findById(id);
    if (!commenter) {
      return res.status(404).json({ message: "User not found" });
    }

    const { slug } = req.params;

    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const { body } = req.body.comment;

    const newComment = await Comment.create({
      body: body,
      author: commenter._id,
      article: article._id,
    });
    await article.addComment(newComment._id);
    return res.status(200).json({
      comment: await newComment.toCommentResponse(commenter),
    });
  } catch (error) {
    next(error);
  }
};
