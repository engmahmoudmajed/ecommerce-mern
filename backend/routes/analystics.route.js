import express from "express";
import { protectRoute,adminRoute } from "../middlewares/auth.middleware.js";
const router = express.Router();
import { getAnalyticsData ,getDailySalesData} from "../controllers/analystics.controller.js";

router.get("/", protectRoute,adminRoute,async (req, res) => {
  try {
    // Your logic to fetch analytics data goes here
    const analyticsData = getAnalyticsData(); // Replace with your actual function to fetch analytics data
    const startDate = new Date(endDate.getTime - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endDate = new Date();
    const dailySalesData = getDailySalesData(startDate, endDate); // Replace with your actual function to fetch daily sales data
    res.json({ ...analyticsData, dailySales: dailySalesData });
  } catch (error) {
    console.error("Error in /analytics route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



export default router;