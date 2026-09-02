import express from "express"
const router = express.Router();
import {signup , login ,logout,refreshToken} from "../controllers/auth.controller.js"

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/refresh-token", refreshToken)

export default router;