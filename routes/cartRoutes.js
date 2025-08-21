const express = require("express");
const { getCart, addToCart, removeFromCart, syncCart, updateCart } = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.delete("/remove", authMiddleware, removeFromCart);
router.post("/sync", authMiddleware, syncCart);
router.put("/update", authMiddleware, updateCart);
module.exports = router;
