const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Received Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token topilmadi yoki noto‘g‘ri formatda!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);

    if (!token) {
        return res.status(401).json({ message: "Token mavjud emas!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        res.status(401).json({ message: `Noto‘g‘ri token! (${error.message})` });
    }
};