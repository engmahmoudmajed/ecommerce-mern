import Product from "../models/product.model.js";

// ==============================
// Get Cart Products
// ==============================
export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    // Get all product IDs from the user's cart
    const productIds = user.cartItems.map((item) => item.product);

    // Find all products that exist in the cart
    const products = await Product.find({
      _id: { $in: productIds },
    });

    // Combine product information with cart quantity
    const cartItems = user.cartItems
      .map((item) => {
        const product = products.find(
          (product) =>
            product._id.toString() === item.product.toString()
        );

        // Product may have been deleted from the database
        if (!product) {
          return null;
        }

        return {
          ...product.toObject(),
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error(
      "Error in getCartProducts controller:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Add Product To Cart
// ==============================
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Check that the product actually exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check if product already exists in cart
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: 1,
      });
    }

    await user.save();

    return res.status(200).json({
      message: "Product added to cart",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error(
      "Error in addToCart controller:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Remove Product From Cart
// ==============================
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    // If no productId is provided, clear the entire cart
    if (!productId) {
      user.cartItems = [];
    } else {
      // Remove only the specified product
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await user.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error(
      "Error in removeAllFromCart controller:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Update Product Quantity
// ==============================
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Quantity must be a non-negative integer",
      });
    }

    // Find product in cart
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    // Quantity 0 means remove the product
    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      existingItem.quantity = quantity;
    }

    await user.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error(
      "Error in updateQuantity controller:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

