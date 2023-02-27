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

export const getCommentsFromArticle: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const id = newReq.userId;

    const { slug } = req.params;
    const article = await Article.findOne({ slug }).exec();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    const loggedin = newReq.loggedin;

    if (loggedin) {
      const loginUser = await User.findById(id).exec();
      if (!loginUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return await res.status(200).json({
        comments: await Promise.all(
          article.comments.map(async (commentId) => {
            const commentObj = await Comment.findById(commentId);
            if (!commentObj) {
              return res.status(404).json({ message: "Comment not found" });
            }
            return await commentObj.toCommentResponse(loginUser);
          })
        ),
      });
    } else {
      return await res.status(200).json({
        comments: await Promise.all(
          article.comments.map(async (commentId) => {
            const commentObj = await Comment.findById(commentId);
            if (!commentObj) {
              return res.status(404).json({ message: "Comment not found" });
            }
            const temp = await commentObj.toCommentResponse(false);
            return temp;
          })
        ),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCommentFromArticle: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    const userId = newReq.userId;
    const commenter = await User.findById(userId).exec();

    const { slug, id } = req.params;

    if (!commenter) {
      return res.status(404).json({ message: "User not found" });
    }

    const article = await Article.findOne({ slug }).exec();
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const comment = await Comment.findById(id).exec();

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author._id.toString() !== commenter._id.toString()) {
      await article.removeComment(id);
      await Comment.deleteOne({ _id: id });
      return res.status(200).json({
        message: "comment has been successfully deleted!!!",
      });
    } else {
      return res.status(403).json({
        error: "only the author of the comment can delete the comment",
      });
    }
  } catch (error) {
    next(error);
  }
};
