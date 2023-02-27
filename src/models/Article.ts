import mongoose, { Model, Types } from "mongoose";
import User, { IUser, IUserMethods, ToProfileJSON } from "./User";

interface IArticle {
  toArticleResponse(
    loginUser: mongoose.Document<unknown, unknown, IUser> &
      IUser & { _id: Types.ObjectId } & IUserMethods
  ): unknown;
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
  toArticleResponse(user: IUser | false): ToArticleResponse;
  updateFavoriteCount(): Promise<IArticle>;
  addComment(commentId: Types.ObjectId): Promise<IArticle>;
  removeComment(commentId: Types.ObjectId): Promise<IArticle>;
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

interface ToArticleResponse {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author?: ToProfileJSON;
}

articleSchema.method(
  "toArticleResponse",
  async function toArticleResponse(user): Promise<ToArticleResponse> {
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
      favoritesCount: this.favouritesCount,
      author: authorObj?.toProfileJSON(user),
    };
  }
);

articleSchema.method(
  "updateFavoriteCount",
  async function updateFavoriteCount(): Promise<IArticle> {
    const favoriteCount = await User.countDocuments({
      favouriteArticles: { $in: [this._id] },
    });

    this.favouritesCount = favoriteCount;

    return this.save();
  }
);

articleSchema.method(
  "addComment",
  async function addComment(commentId): Promise<IArticle> {
    if (this.comments.indexOf(commentId) === -1) {
      this.comments.push(commentId);
    }

    return this.save();
  }
);

articleSchema.method(
  "removeComment",
  async function removeComment(commentId): Promise<IArticle> {
    if (this.comments.indexOf(commentId) !== -1) {
      this.comments.remove(commentId);
    }

    return this.save();
  }
);

export default mongoose.model<IArticle, ArticleModel>("Article", articleSchema);
