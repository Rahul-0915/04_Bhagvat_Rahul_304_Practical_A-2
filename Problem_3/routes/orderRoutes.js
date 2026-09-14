const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/history", authMiddleware, (req, res) => {

    res.status(200).json({
        message: "Order history accessed successfully",
        customer: req.customer
    });

});

module.exports = router;