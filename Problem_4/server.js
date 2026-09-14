const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const app = express()
app.use(express.json())
mongoose.connect("mongodb://localhost:27017/bookstore").then(() => {
  console.log("MongoDB COnnected")
}).catch((error) => {
  console.log("MongoDB Connection Failed", error)
})
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const user = await User.create({
      name, email, password, role
    })
    res.status(201).json({
      message: "User Registered SuccessFully", user
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})
app.listen(3000, () => {
  console.log("Server Running on Port 3000")
})