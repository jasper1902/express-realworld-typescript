import mongoose, { Model, Types } from "mongoose";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import uniqueValidator from "mongoose-unique-validator";
dotenv.config();

export interface IUser {
  username: string;
  password: string;
  email: string;
  bio: string;
  image: string;
  favouriteArticles: string[];
  followingUsers: string[];
}

interface IUserMethods {
  toUserResponse(): {
    username: string;
    email: string;
    bio: string;
    image: string;
    token: string;
  };
  toProfileJSON(user?: unknown): ToProfileJSON;
  follow(id: Types.ObjectId): Promise<IUser>;
  unfollow(id: Types.ObjectId): Promise<IUser>;
  isFavourite(id: Types.ObjectId): boolean;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      min: 4,
      max: 32,
      validate: {
        validator: (v: string) => /^[a-zA-Z0-9]+$/.test(v),
        message: (props) =>
          `${props.value} is not a valid username. Only alphanumeric characters are allowed.`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      min: 6,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      index: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
      trim: true,
      validate: {
        validator: (v: string) =>
          /^([\w-\\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v),
        message: (props) => `${props.value} is not a valid email.`,
      },
    },
    bio: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://static.productionready.io/images/smiley-cyrus.jpg",
    },
    favouriteArticles: [
      {
        type: Types.ObjectId,
        ref: "Article",
      },
    ],
    followingUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique.",
});
userSchema.method(
  "generateAccessToken",
  function generateAccessToken(): string {
    let TOKEN: string;
    if (process.env.TOKEN) {
      TOKEN = process.env.TOKEN;
    } else {
      throw new Error("TOKEN not defined");
    }

    const accessToken: string = jwt.sign(
      {
        user: {
          id: this._id,
          email: this.email,
          password: this.password,
        },
      },
      TOKEN,
      { expiresIn: "1d" }
    );
    return accessToken;
  }
);

interface ToUserResponse {
  username: string;
  email: string;
  bio: string;
  image: string;
  token: string;
}

userSchema.method("toUserResponse", function toUserResponse(): ToUserResponse {
  return {
    username: this.username,
    email: this.email,
    bio: this.bio,
    image: this.image,
    token: this.generateAccessToken(),
  };
});

export interface ToProfileJSON {
  username: string;
  bio: string;
  image: string;
  following: IUser | boolean;
}

interface ToProfileJSONParameter {
  _id: string;
  isFollowing?(_id: string): boolean | IUser;
  username: string;
  password: string;
  email: string;
  bio: string;
  image: string;
  favouriteArticles: string[];
  followingUsers: string[];
}

userSchema.method(
  "toProfileJSON",
  function toProfileJSON(user?: ToProfileJSONParameter): ToProfileJSON {
    return {
      username: this.username,
      bio: this.bio,
      image: this.image,
      following: user
        ? user.isFollowing
          ? user.isFollowing(user._id)
          : false
        : false,
    };
  }
);

userSchema.method("isFollowing", function isFollowing(id: string): boolean {
  const idString: string = id.toString();
  for (const followingUser of this.followingUsers) {
    if (followingUser.toString() === idString) {
      return true;
    }
  }
  return false;
});

userSchema.method("follow", function follow(id: Types.ObjectId) {
  if (this.followingUsers.indexOf(id) === -1) {
    this.followingUsers.push(id);
  }
  return this.save();
});

userSchema.method("unfollow", function unfollow(id: Types.ObjectId) {
  if (this.followingUsers.indexOf(id) === -1) {
    this.followingUsers.remove(id);
  }
  return this.save();
});

userSchema.method("isFavourite", function isFavourite(id: Types.ObjectId) {
  const idStr = id.toString();
  for (const article of this.favouriteArticles) {
    if (article.toString() === idStr) {
      return true;
    }
  }
  return false;
});

const User = mongoose.model<IUser, UserModel>("User", userSchema);
export default User;