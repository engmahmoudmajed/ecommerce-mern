import Coupon from "../models/coupon.model.js";


export const ValidateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, userId: req.user._id });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const createCoupon = async (req, res) => { }
export const getAllCoupons = async (req, res) => { }
export const updateCoupon = async (req, res) => { }
export const deleteCoupon = async (req, res) => { }
