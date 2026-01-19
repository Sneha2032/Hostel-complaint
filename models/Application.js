const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    studentName: String,
    enrollment: String,
    type: String,
    fromDate: String,
    toDate: String,
    reason: String,
    status: { type: String, default: "Pending" },
    adminRemark: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);
