const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    target: {
        type: String,
        enum: ["ALL", "UG", "PG"],
        default: "ALL"
    }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
