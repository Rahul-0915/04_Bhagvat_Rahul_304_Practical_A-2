const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  cancelOrder
} = require("../controllers/orderController");

router.delete(
  "/:id",
  authMiddleware,
  cancelOrder
);

module.exports = router;