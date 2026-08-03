import express from "express"
const router = express.Router();
import {getAllProducts,getFeaturedProducts,createProduct,deleteProduct} from "../controllers/product.controler.js"
import {protectRoute,adminRoute} from "../middlewares/auth.middleware.js"

router.get("/",protectRoute,adminRoute,getAllProducts)
router.get("/featured",getFeaturedProducts)
router.post("/",protectRoute,adminRoute,createProduct);
router.delete("/:id",protectRoute,adminRoute,deleteProduct)
// router.get("/:id",protectRoute,adminRoute,getAllProducts)
// router.put("/:id",protectRoute,adminRoute,getAllProducts)

export default router;