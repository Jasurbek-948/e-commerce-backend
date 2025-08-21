const express = require("express");
const { addReview, getReviews } = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:productId", getReviews);

// ✅ Yangi sharh qo‘shish (POST)
router.post("/add", addReview);

module.exports = router;
 