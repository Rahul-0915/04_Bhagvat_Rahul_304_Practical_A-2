const mongoose = require("mongoose");
const Order = require("../models/Order");

const cancelOrder = async (req, res) => {
  try {
    console.log("DATABASE:", Order.db.name);
    console.log("COLLECTION:", Order.collection.name);

    const orders = await Order.find({});

    console.log("ALL ORDERS FROM NODE:", orders);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  cancelOrder
};