import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const TotalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const [totalSales, totalRevenue] = salesData.length > 0 ? [salesData[0].totalSales, salesData[0].totalRevenue] : [0, 0];
  return {
    users: totalUsers,
    products: TotalProducts,
    sales: totalSales,
    revenue: totalRevenue,
  };
};

const getDailySalesData = async (startDate, endDate) => {
  try { 
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
    ]);
    const dateArray = getDatesInRange(startDate, endDate).map((date) => date.toISOString().split("T")[0]);

    return dateArray.map((date) => {
      const salesDataForDate = dailySalesData.find((item) => item._id === date);
      return {
        date,
        totalSales: salesDataForDate ? salesDataForDate.totalSales : 0,
        totalRevenue: salesDataForDate ? salesDataForDate.totalRevenue : 0,
      };
    });
  } catch (error) {
    console.error("Error in getDailySalesData:", error);
    throw error;
  }
};
 

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export { getAnalyticsData, getDailySalesData };
