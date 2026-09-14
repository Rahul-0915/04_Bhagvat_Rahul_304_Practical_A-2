const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

// Order routes
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bookstore API is running"
  });
});

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/bookstore")
  .then(() => {
    console.log("MongoDB connected");
    console.log("DATABASE:", mongoose.connection.name);
    console.log("HOST:", mongoose.connection.host);

    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });