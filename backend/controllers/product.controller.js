import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (!featuredProducts) {
      featuredProducts = await Product.find({ isFeatured: true }).lean();
      await redis.set("featured_products", JSON.stringify(featuredProducts), { ex: 3600 });
    } else {
      featuredProducts = typeof featuredProducts === "string"
        ? JSON.parse(featuredProducts)
        : featuredProducts;
    }
    res.status(200).json({ featuredProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createProduct = async (req, res) => {
  try {
    const { name, description, price, isFeatured, category, imageUrl } = req.body;
    const newProduct = new Product({ name, description, price, isFeatured, category, imageUrl });
    let cloudnaryResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "products",
      width: 500,
      height: 500,
      crop: "fill"
    });
    newProduct.imageUrl = cloudnaryResponse.secure_url;
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete the image from Cloudinary if it exists
    if (deletedProduct.imageUrl) {
      const publicId = deletedProduct.imageUrl
        .split("/")
        .pop()
        .split(".")[0];

      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          price: 1
        }
      }

    ])
    res.json(products)
  } catch (error) {
    console.log("Error in Recommendation", error.message);
    res.status(500).json({ message: "Server Error", error: error.message })
  }
}


export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category })
    res.json(products)
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status.json({ message: "Server error", error: error.message });
  }
}




export const toggleFeaturedProduct = async (req, res) => {
  try {

    // Delete the product from the database
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      // update cache
      await updateFeatureProductCache();
      res.json(updatedProduct);
    }else{
      res.status(404).json({message:"Product not found"})
    }

  } catch (error) {
    console.error("error in toggle product", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


async function updateFeatureProductCache() {
  try {
    const featuredProduct = await Product.find({isFeatured:true}).lean();
    await redis.set("featured_products",json.stringify(featuredProduct));
  } catch (error) {
    console.log("error in update cache function")
  }
}




