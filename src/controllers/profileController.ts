import User from "../models/User";
import { RequestHandler } from "express";

export interface JWTNewRequest extends Request {
  userEmail: string;
  userId: string;
  userHashedPwd: string;
  loggedin?: boolean;
}

// @desc get user profile
// Warning: if password or email is updated, client-side must update the token
// @route GET /api/profiles/:username
// @access Private
// @return User
export const getProfile: RequestHandler = async (req, res) => {
  const newReq = req as unknown as JWTNewRequest;
  const { username } = req.params;
  const loggedin = newReq.loggedin;

  const user = await User.findOne({ username }).exec();

  if (!user) {
    res.status(404).json({ message: "User not found" });
  }

  if (!loggedin) {
    return res.status(200).json({ profile: user?.toProfileJSON() });
  } else {
    const loginUser = await User.findOne({ email: newReq.userEmail }).exec();
    return res.status(200).json({
      profile: user?.toProfileJSON(loginUser),
    });
  }
};

export const followerUser: RequestHandler = async (req, res) => {
  const newReq = req as unknown as JWTNewRequest;
  const { username } = req.params;
  const loginUser = await User.findById(newReq.userId).exec();
  const user = await User.findOne({ username }).exec();

  if (!loginUser || !user) {
    return res.status(404).json({ message: "User not found" });
  }

  await loginUser.follow(user._id);
  res.status(200).json({ profile: user.toProfileJSON(loginUser) });
};

export const unFollowerUser: RequestHandler = async (req, res) => {
  const newReq = req as unknown as JWTNewRequest;
  const { username } = req.params;
  const loginUser = await User.findById(newReq.userId).exec();
  const user = await User.findOne({ username }).exec();

  if (!loginUser || !user) {
    return res.status(404).json({ message: "User not found" });
  }

  await loginUser.unfollow(user._id);
  res.status(200).json({ profile: user.toProfileJSON(loginUser) });
};
