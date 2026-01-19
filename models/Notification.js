const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    enrollment: String,
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
