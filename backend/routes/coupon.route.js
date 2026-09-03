import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  ValidateCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/", protectRoute, createCoupon);
router.get("/", protectRoute, getAllCoupons);
router.get("/:id", protectRoute, getCouponById);
router.get("/validate", protectRoute, ValidateCoupon);
router.put("/:id", protectRoute, updateCoupon);
router.delete("/:id", protectRoute, deleteCoupon);

export default router;
