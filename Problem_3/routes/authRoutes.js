const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Customer = require("../models/Customer");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find customer
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        console.log("CUSTOMER ROLE:", customer.role);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: customer._id,
                email: customer.email,
                role: customer.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;