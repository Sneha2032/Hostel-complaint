const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    studentName: String,
    enrollment: String,
    type: String,
    description: String,
    photo: String,
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", complaintSchema);
