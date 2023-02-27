import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import Joi from "joi";
import { JWTNewRequest } from "./profileController";

// @desc registration for a user
// @route POST /api/users/register
// @access Public
// @required fields {email, username, password}
// @return User
interface UserRegisterReq {
  user: {
    email: string;
    password: string;
    username: string;
  };
}
export const registerUser: RequestHandler<
  unknown,
  unknown,
  UserRegisterReq,
  unknown
> = async (req, res, next) => {
  try {
    const { user } = req.body;

    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(4).required(),
    });

    // validate user object
    const { error } = userSchema.validate(user);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // confirm data
    if (!user || !user.email || !user.password || !user.username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailExist = await User.findOne({ email: user.email });
    const usernameExist = await User.findOne({ username: user.username });

    if (emailExist) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (usernameExist) {
      return res.status(400).json({ error: "Username already exists" });
    }

    //   hash password
    const hashPassword = await bcrypt.hash(user.password, 10);

    const userObj = {
      email: user.email,
      password: hashPassword,
      username: user.username,
    };

    const createdUser = await User.create(userObj);

    if (createdUser) {
      return res.status(201).json({ user: createdUser.toUserResponse() });
    } else {
      res.status(422).json({
        errors: {
          body: "Unable to register a user",
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc get currently logged-in user
// @route GET /api/user
// @access Private
// @return User

export const getcurrentUser: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as JWTNewRequest;
    // After authentication; email and hashsed password was stored in req
    const email = newReq.userEmail;
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      user: user.toUserResponse(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc login for a user
// @route POST /api/users/login
// @access Public
// @required fields {email, password}
// @return User
interface LoginReq {
  user: {
    email: string;
    password: string;
  };
}
export const loginUser: RequestHandler<
  unknown,
  unknown,
  LoginReq,
  unknown
> = async (req, res, next) => {
  try {
    const { user } = req.body;

    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    // validate user object
    const { error } = userSchema.validate(user);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!user || !user.email || !user.password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const userAccount = await User.findOne({ email: user.email }).exec();

    if (!userAccount) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      user.password,
      userAccount.password
    );
    if (!validPassword) {
      return res.status(401).json({ error: "email or password is incorrect" });
    }

    res.status(200).json(userAccount.toUserResponse());
  } catch (error) {
    next(error);
  }
};

// @desc update currently logged-in user
// Warning: if password or email is updated, client-side must update the token
// @route PUT /api/user
// @access Private
// @return User
export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req.body;

    const userSchema = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      username: Joi.string(),
      bio: Joi.string(),
      image: Joi.string(),
    });

    const { error } = userSchema.validate(user);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newReq = req as unknown as JWTNewRequest;
    const email = newReq.userEmail;
    const targetUser = await User.findOne({ email: email });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email && targetUser.email) {
      targetUser.email = user.email;
    }
    if (user.username && targetUser.username) {
      targetUser.username = user.username;
    }
    if (user.password && targetUser.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      targetUser.password = hashedPassword;
    }
    if (user.bio) {
      targetUser.bio = user.bio;
    }
    if (user.image && targetUser.image) {
      targetUser.image = user.image;
    }
    await targetUser.save();

    return res.status(200).json({ user: targetUser.toUserResponse() });
  } catch (error) {
    next(error);
  }
};
