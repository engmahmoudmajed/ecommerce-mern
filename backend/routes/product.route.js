import express from "express"
const router = express.Router();
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct
} from "../controllers/product.controller.js"
import {protectRoute,adminRoute} from "../middlewares/auth.middleware.js"

router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/featured",getFeaturedProducts);
router.get("/recommendations",getRecommendedProducts);
router.get("/category/:category",getProductsByCategory);
router.post("/",protectRoute,adminRoute,createProduct);
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProduct);
router.delete("/:id",protectRoute,adminRoute,deleteProduct);
// router.get("/:id",protectRoute,adminRoute,getAllProducts)
// router.put("/:id",protectRoute,adminRoute,getAllProducts)

export default router;