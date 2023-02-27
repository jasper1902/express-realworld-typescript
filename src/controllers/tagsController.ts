import { RequestHandler, Request, Response } from "express";
import Article from "../models/Article";

export const getTags: RequestHandler = async (req: Request, res: Response) => {
  // distinct "tagList" will return either an error or a list of distinct tags
  const tags = await Article.find().distinct("tagList").exec();
  // console.log(tags);
  res.status(200).json({
    tags: tags,
  });
};
