import mongoose, { Model, Types } from "mongoose";
import User, { IUser } from "./User";

interface IArticle {
  title: string;
  description: string;
  body: string;
  tagList: string[];
  author: Types.ObjectId;
  slug: string;
  favouritesCount: number;
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface IArticleMethods {
  toArticleResponse(user: IUser): unknown;
}

type ArticleModel = Model<IArticle, object, IArticleMethods>;

const articleSchema = new mongoose.Schema<
  IArticle,
  ArticleModel,
  IArticleMethods
>(
  {
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    body: {
      type: String,
      require: true,
    },
    tagList: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    favouritesCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

articleSchema.method(
  "toArticleResponse",
  async function toArticleResponse(user) {
    const authorObj = await User.findById(this.author).exec();
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      tagList: this.tagList,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      favorited: user ? user.isFavourite(this._id) : false,
      favoritesCount: this.favoritesCount,
      author: authorObj?.toProfileJSON(user),
    };
  }
);

export default mongoose.model<IArticle, ArticleModel>("Article", articleSchema);
