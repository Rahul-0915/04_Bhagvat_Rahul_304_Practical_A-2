const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.get("/inventory", authenticateToken, adminOnly, (req, res) => {
    const inventory = [
        {
            book: "JavaScript Basics",
            stock: 25,
            sales: 10
        },
        {
            book: "Node.js Guide",
            stock: 15,
            sales: 8
        },
        {
            book: "MongoDB Essentials",
            stock: 30,
            sales: 20
        }
    ];

    res.status(200).json(inventory);
});

module.exports = router;