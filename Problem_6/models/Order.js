const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Shipped", "Cancelled"],
    default: "Pending"
  }
});

module.exports = mongoose.model("Order", orderSchema);