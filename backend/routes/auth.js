import express from "express";
import { login, googleLogin } from "../controllers/authController.js";
import { register } from "../controllers/registerController.js";
import { googleRegister } from "../controllers/googleRegisterController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/google-register", googleRegister);

export default router;
