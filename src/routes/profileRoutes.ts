import express, { Router } from "express";
import {
  followerUser,
  getProfile,
  unFollowerUser,
} from "../controllers/profileController";
import { verifyJWT } from "../middlewares/verifyJWT";

import { verifyJWTOptional } from "../middlewares/verifyJWTOptional";

// Create a router instance
const router: Router = express.Router();
router.get("/:username", verifyJWTOptional, getProfile);

router.post("/:username/follow", verifyJWT, followerUser);

router.delete("/:username/follow", verifyJWT, unFollowerUser);

export default router;
