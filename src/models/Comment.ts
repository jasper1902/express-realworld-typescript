import mongoose, { Types, Model } from "mongoose";
import User, { IUser, ToProfileJSON } from "./User";

interface IComment {
  body: string;
  author: Types.ObjectId;
  article: Types.ObjectId;
}

interface ICommentMeyhods {
  toCommentResponse(
    user: IUser | false
  ): Promise<ToCommentResponse | undefined>;
}

type CommentModel = Model<IComment, object, ICommentMeyhods>;

const CommentSchema = new mongoose.Schema<
  IComment,
  CommentModel,
  ICommentMeyhods
>(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  },
  {
    timestamps: true,
  }
);

interface ToCommentResponse {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: ToProfileJSON;
}

CommentSchema.method(
  "toCommentResponse",
  async function toCommentResponse(
    user: IUser | false
  ): Promise<ToCommentResponse | undefined> {
    const author = await User.findById(this.author).exec();

    if (author) {
      return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: author.toProfileJSON(user),
      };
    }
  }
);

export default mongoose.model<IComment, CommentModel>("Comment", CommentSchema);
