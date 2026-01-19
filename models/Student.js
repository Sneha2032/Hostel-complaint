const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    dept: String,

    course: {
        type: String,
        enum: ["UG", "PG"],
        required: true
    },

    admissionYear: {
        type: Number, // e.g. 2023
        required: true
    },

    mobile: String,
    email: String,
    room: String,

    enrollment: {
        type: String,
        unique: true,
        required: true
    },

    password: String
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);


