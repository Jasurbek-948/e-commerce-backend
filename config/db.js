const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB bazasiga muvaffaqiyatli ulandi");
    } catch (error) {
        console.error("MongoDB ulanishda xatolik:", error);
        process.exit(1);
    }
};

connectDB();
module.exports = mongoose;
