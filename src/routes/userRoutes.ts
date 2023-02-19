import express, { Router } from "express";
import {
  getcurrentUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userController";
import { verifyJWT } from "../middlewares/verifyJWT";

// Create a router instance
const router: Router = express.Router();
router.post("/users", registerUser);
router.get("/user", verifyJWT, getcurrentUser);
router.post("/users/login", loginUser);
router.put("/user", verifyJWT, updateUser);

export default router;
