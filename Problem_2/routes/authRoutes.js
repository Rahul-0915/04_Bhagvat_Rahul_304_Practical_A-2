const express = require("express");
const bcrypt = require("bcrypt");

const Customer = require("../models/Customer");

const router = express.Router();


// ==========================
// SIGNUP
// ==========================
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });

        if (existingCustomer) {
            return res.status(400).json({
                message: "Customer already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create customer
        const customer = await Customer.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Customer registered successfully",
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ==========================
// LOGIN
// ==========================
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

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;