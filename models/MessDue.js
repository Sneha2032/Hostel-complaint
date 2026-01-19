// models/MessDue.js
const mongoose = require("mongoose");

const messDueSchema = new mongoose.Schema({
    enrollment: {
        type: String,
        required: true
    },
    studentName: String,
    semester: String,
    month: String,
    amount: Number,
    status: {
        type: String,
        default: "Unpaid"
    },
    paidOn: Date
}, { timestamps: true });

module.exports = mongoose.model("MessDue", messDueSchema);

