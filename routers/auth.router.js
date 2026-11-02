import express from "express";
import { RegisterUser, LoginUser } from "../controllers/auth.controller.js";
import {
  RegisterUser,
  LoginUser,
  GetMe,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

const AuthRouter = express.Router();
AuthRouter.post("/register", RegisterUser);
AuthRouter.post("/login", LoginUser);
AuthRouter.get("/me", auth, GetMe);

export default AuthRouter;
