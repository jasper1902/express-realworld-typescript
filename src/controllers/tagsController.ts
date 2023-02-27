import { RequestHandler, Request, Response } from "express";
import Article from "../models/Article";

export const getTags: RequestHandler = async (req: Request, res: Response) => {
  const tags = await Article.find().distinct("tagList").exec();
  res.status(200).json({
    tags: tags,
  });
};
