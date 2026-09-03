import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createCheckoutSession ,checkoutSuccess} from "../controllers/payment.controller.js";


const router = express.Router();

router.post("/create-checkout-session", protectRoute, async (req, res) => {
  try {
    await createCheckoutSession(req, res);
  } catch (error) {
    console.error("Error in /create-checkout-session route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/checkout-success", protectRoute,checkoutSuccess);

export default router;