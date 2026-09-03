import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";

// ========================================
// Create Stripe Checkout Session
// ========================================
export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;
		const userId = req.user._id;

		// ----------------------------------------
		// Validate products
		// ----------------------------------------
		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({
				message: "Products array is required and cannot be empty",
			});
		}

		// ----------------------------------------
		// Get products from database
		// ----------------------------------------
		const productIds = products.map((item) => item._id);

		const dbProducts = await Product.find({
			_id: { $in: productIds },
		});

		if (dbProducts.length !== products.length) {
			return res.status(400).json({
				message: "One or more products were not found",
			});
		}

		// ----------------------------------------
		// Create Stripe line items
		// ----------------------------------------
		let totalAmount = 0;

		const lineItems = products.map((item) => {
			const product = dbProducts.find(
				(product) => product._id.toString() === item._id.toString()
			);

			const quantity = Number(item.quantity);

			// Validate quantity
			if (!Number.isInteger(quantity) || quantity <= 0) {
				throw new Error(`Invalid quantity for product: ${product.name}`);
			}

			// Use price from MongoDB, NOT frontend
			const unitAmount = Math.round(product.price * 100);

			totalAmount += unitAmount * quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: product.image ? [product.image] : [],
					},
					unit_amount: unitAmount,
				},
				quantity,
			};
		});

		// ----------------------------------------
		// Find and validate coupon
		// ----------------------------------------
		let coupon = null;

		if (couponCode) {
			const normalizedCouponCode = couponCode.trim().toUpperCase();

			coupon = await Coupon.findOne({
				code: normalizedCouponCode,
				userId,
				isActive: true,
			});

			if (!coupon) {
				return res.status(400).json({
					message: "Invalid or inactive coupon",
				});
			}

			// Check expiration
			if (coupon.expirationDate < new Date()) {
				return res.status(400).json({
					message: "Coupon has expired",
				});
			}
		}

		// ----------------------------------------
		// Create Stripe coupon
		// ----------------------------------------
		let stripeCouponId = null;

		if (coupon) {
			stripeCouponId = await createStripeCoupon(
				coupon.discountPercentage
			);
		}

		// ----------------------------------------
		// Create Stripe Checkout Session
		// ----------------------------------------
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],

			line_items: lineItems,

			mode: "payment",

			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,

			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,

			...(stripeCouponId && {
				discounts: [
					{
						coupon: stripeCouponId,
					},
				],
			}),

			metadata: {
				userId: userId.toString(),

				couponCode: coupon?.code || "",

				products: JSON.stringify(
					products.map((item) => {
						const product = dbProducts.find(
							(product) =>
								product._id.toString() === item._id.toString()
						);

						return {
							id: product._id.toString(),
							quantity: Number(item.quantity),
							price: product.price,
						};
					})
				),
			},
		});

		// ----------------------------------------
		// Calculate estimated total for response
		// ----------------------------------------
		const discountAmount = coupon
			? Math.round(
					(totalAmount * coupon.discountPercentage) / 100
				)
			: 0;

		const finalAmount = totalAmount - discountAmount;

		// ----------------------------------------
		// Create a new coupon for large purchases
		// ----------------------------------------
		if (finalAmount >= 20000) {
			await createNewCoupon(userId);
		}

		return res.status(200).json({
			id: session.id,
			totalAmount: finalAmount / 100,
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);

		return res.status(500).json({
			message: "Error processing checkout",
		});
	}
};

// ========================================
// Checkout Success
// ========================================
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;

		if (!sessionId) {
			return res.status(400).json({
				message: "Session ID is required",
			});
		}

		// ----------------------------------------
		// Get Stripe session
		// ----------------------------------------
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// ----------------------------------------
		// Make sure payment was successful
		// ----------------------------------------
		if (session.payment_status !== "paid") {
			return res.status(400).json({
				message: "Payment has not been completed",
			});
		}

		// ----------------------------------------
		// Prevent duplicate orders
		// ----------------------------------------
		const existingOrder = await Order.findOne({
			stripeSessionId: session.id,
		});

		if (existingOrder) {
			return res.status(200).json({
				success: true,
				message: "Order already exists",
				orderId: existingOrder._id,
			});
		}

		// ----------------------------------------
		// Read products from metadata
		// ----------------------------------------
		const products = JSON.parse(session.metadata.products);

		// ----------------------------------------
		// Create order
		// ----------------------------------------
		const newOrder = await Order.create({
			user: session.metadata.userId,

			products: products.map((product) => ({
				product: product.id,
				quantity: product.quantity,
				price: product.price,
			})),

			totalAmount: session.amount_total / 100,

			stripeSessionId: session.id,
		});

		await newOrder.save();
		// ----------------------------------------
		// Deactivate coupon after successful order
		// ----------------------------------------
		if (session.metadata.couponCode) {
			await Coupon.findOneAndUpdate(
				{
					code: session.metadata.couponCode,
					userId: session.metadata.userId,
				},
				{
					isActive: false,
				}
			);
		}

		return res.status(200).json({
			success: true,
			message: "Payment successful and order created",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error("Error processing successful checkout:", error);

		return res.status(500).json({
			message: "Error processing successful checkout",
		});
	}
};

// ========================================
// Create Stripe Coupon
// ========================================
const createStripeCoupon = async (discountPercentage) => {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
};

// ========================================
// Create New User Coupon in DB
// ========================================
const createNewCoupon = async (userId) => {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = await Coupon.create({
		code: `GIFT${Math.random()
			.toString(36)
			.substring(2, 8)
			.toUpperCase()}`,

		discountPercentage: 10,

		expirationDate: new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		),

		userId,
	});

	return newCoupon;
};