require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
// const MessDue = require("./models/MessDue");
const Notice=require("./models/Notice");
const cloudinary=require("./config/cloudinary");
const {CloudinaryStorage}=require("multer-storage-cloudinary");

const app = express();

/* =======================
   DATABASE CONNECTION
======================= */
const connectDB = require("./config/db");
connectDB();

/* =======================
   MODELS
======================= */
const Student = require("./models/Student");
const Admin = require("./models/Admin");
const Complaint = require("./models/Complaint");
const Application = require("./models/Application");
const Notification = require("./models/Notification");
const MessDue = require("./models/MessDue");

/* =======================
   MIDDLEWARE
======================= */
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

/* =======================
   MULTER (FILE UPLOAD)
======================= */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hostel-complaints",
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});

const upload = multer({ storage });


/* =======================
   HOME
======================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

/* =======================
//    SEED ADMIN (Initialize admin user)
// ======================= */
// app.get("/seed-admin", async (req, res) => {
//     try {
//         const existingAdmin = await Admin.findOne({ username: "admin" });
//         if (existingAdmin) {
//             return res.send("Admin already exists!");
//         }

//         await Admin.create({ username: "admin", password: "admin123" });
//         res.send("✅ Admin user created successfully! Username: admin, Password: admin123");
//     } catch (error) {
//         console.error("Seed admin error:", error);
//         res.status(500).send("Error creating admin: " + error.message);
//     }
// });

/* =======================
   STUDENT AUTH
======================= */
app.post("/signup", async (req, res) => {
    try {
        const {
            name,
            dept,
            course,
            admissionYear,
            mobile,
            email,
            room,
            enrollment,
            password
        } = req.body;

        // prevent duplicate enrollment
        const exists = await Student.findOne({ enrollment });
        if (exists) return res.send("Student already registered");

        const student = new Student({
            name,
            dept,
            course,
            admissionYear,
            mobile,
            email,
            room,
            enrollment,
            password
        });

        await student.save();
        res.redirect("/student-login.html");
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send("Internal server error");
    }
});


app.post("/login", async (req, res) => {
    try {
        const { enrollment, password } = req.body;

        const student = await Student.findOne({ enrollment, password });
        if (!student) return res.send("Invalid credentials");

        req.session.student = student;
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

/* =======================
   STUDENT DASHBOARD
======================= */
app.get("/dashboard", async (req, res) => {
    try {
        if (!req.session.student) return res.redirect("/student-login.html");

        const complaints = await Complaint.find({
            enrollment: req.session.student.enrollment
        });

        const notifications = await Notification.find({
            enrollment: req.session.student.enrollment,
            isRead: false
        });

        const notices = await Notice.find({
            $or: [
                { target: "ALL" },
                { target: req.session.student.course }
            ]
        }).sort({ createdAt: -1 }).limit(10);  // Fetch relevant notices

        console.log("Student course:", req.session.student.course);
        console.log("Fetched notices:", notices.length);

        res.render("student-dashboard", {
            student: req.session.student,
            complaints,
            notifications,
            notices
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Internal server error");
    }
});

/* =======================
   COMPLAINTS
======================= */
app.get("/complaint", (req, res) => {
    if (!req.session.student) return res.redirect("/student-login.html");
    res.render("complaint", { student: req.session.student });
});

app.post("/complaint", upload.single("photo"), async (req, res) => {
    const complaint = new Complaint({
        studentName: req.session.student.name,
        enrollment: req.session.student.enrollment,
        type: req.body.type,
        description: req.body.description,
        photo: req.file ? req.file.path : null

    });

    await complaint.save();
    res.redirect("/dashboard");
});

/* =======================
   APPLICATIONS (STUDENT)
======================= */
app.get("/application", async (req, res) => {
    if (!req.session.student) return res.redirect("/student-login.html");

    const applications = await Application.find({
        enrollment: req.session.student.enrollment
    });

    res.render("application", {
        student: req.session.student,
        applications
    });
});

app.post("/application", async (req, res) => {
    const application = new Application({
        studentName: req.session.student.name,
        enrollment: req.session.student.enrollment,
        type: req.body.type,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        reason: req.body.reason
    });

    await application.save();
    res.redirect("/dashboard");
});

/* =======================
   ADMIN AUTH
======================= */
app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username, password });
        if (!admin) return res.send("Invalid admin credentials");

        req.session.admin = admin;
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

app.get("/admin/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

/* =======================
   ADMIN DASHBOARD
======================= */
app.get("/admin/dashboard", async (req, res) => {
    try {
        if (!req.session.admin) return res.redirect("/admin-login.html");

        // Complaints
        const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(50);

        // Recent applications (show latest 10)
        const applications = await Application.find().sort({ createdAt: -1 }).limit(10);

        // Mess due summary: total unpaid and recent dues
        const totalUnpaidDues = await MessDue.countDocuments({ status: "Unpaid" });
        const recentDues = await MessDue.find().sort({ createdAt: -1 }).limit(5);

        res.render("admin-dashboard", {
            complaints,
            applications,
            duesSummary: { totalUnpaid: totalUnpaidDues },
            recentDues
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).send("Error loading dashboard: " + error.message);
    }
});

/* =======================
   ADMIN UPDATE COMPLAINT
======================= */
app.post("/admin/update-status", async (req, res) => {
    try {
        const { id, status } = req.body;

        const complaint = await Complaint.findById(id);
        complaint.status = status;
        await complaint.save();

        // 🔔 notify student
        await Notification.create({
            enrollment: complaint.enrollment,
            message: `Your complaint is now ${status}`
        });

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Update complaint error:", error);
        res.status(500).send("Error updating complaint: " + error.message);
    }
});

/* =======================
   ADMIN APPLICATIONS
======================= */
app.get("/admin/applications", async (req, res) => {
    try {
        if (!req.session.admin) return res.redirect("/admin-login.html");

        const applications = await Application.find();
        res.render("admin-applications", { applications });
    } catch (error) {
        console.error("Admin applications error:", error);
        res.status(500).send("Error loading applications: " + error.message);
    }
});

app.post("/admin/update-application", async (req, res) => {
    try {
        const { id, status, adminRemark } = req.body;

        const application = await Application.findById(id);
        application.status = status;
        application.adminRemark = adminRemark;
        await application.save();

        // 🔔 notify student
        await Notification.create({
            enrollment: application.enrollment,
            message: `Your ${application.type} application was ${status}. ${adminRemark || ""}`
        });

        res.redirect("/admin/applications");
    } catch (error) {
        console.error("Update application error:", error);
        res.status(500).send("Error updating application: " + error.message);
    }
});

/* =======================
   NOTIFICATIONS
======================= */
app.post("/notifications/read", async (req, res) => {
    await Notification.updateMany(
        { enrollment: req.session.student.enrollment },
        { isRead: true }
    );
    res.sendStatus(200);
});
function getCurrentSemesterType() {
    const month = new Date().getMonth() + 1; // 1–12

    // Jul–Dec → Odd, Jan–Jun → Even
    return month >= 7 ? "Odd" : "Even";
}

/* =======================
   MESS
======================= */

app.get("/mess", async (req, res) => {
    const dues = await MessDue.find({
        enrollment: req.session.student.enrollment
    });

    res.render("mess", { dues });
});


app.get("/receipt/:id", async (req, res) => {
    if (!req.session.student) return res.redirect("/student-login.html");

    const due = await MessDue.findById(req.params.id);

    if (!due) return res.send("Receipt not found");

    res.render("receipt", {
        student: req.session.student,
        due
    });
});


app.get("/mess", async (req, res) => {
    if (!req.session.student)
        return res.redirect("/student-login.html");

    const dues = await MessDue.find({
        enrollment: req.session.student.enrollment
    });

    res.render("mess", { dues });
});

app.post("/admin/mess/release", async (req, res) => {
    try {
        if (!req.session.admin)
            return res.redirect("/admin-login.html");

        const { course, month, amount } = req.body;

        const students = await Student.find({ course });

        for (let s of students) {

            // 1️⃣ Create mess due
            await MessDue.create({
                enrollment: s.enrollment,
                studentName: s.name,
                semester: "Auto",
                month,
                amount,
                status: "Unpaid"
            });

            // 2️⃣ Create notification
            await Notification.create({
                enrollment: s.enrollment,
                message: `New mess dues of ₹${amount} for ${month} have been released.`
            });
        }

        res.redirect("/admin/mess-dues");
    } catch (error) {
        console.error("Mess release error:", error);
        res.status(500).send("Error releasing mess dues: " + error.message);
    }
});

// Render release dues form for admin
app.get("/admin/mess", async (req, res) => {
    if (!req.session.admin) return res.redirect("/admin-login.html");
    res.render("admin-mess");
});




// const Student = require("../models/Student");
// const MessDue = require("../models/MessDue");

app.get("/admin/mess-dues", async (req, res) => {
    try {
        if (!req.session.admin)
            return res.redirect("/admin-login.html");

        const { course } = req.query;

        let dues = [];

        if (course) {
            const students = await Student.find({ course });
            const enrollments = students.map(s => s.enrollment);

            dues = await MessDue.find({
                enrollment: { $in: enrollments }
            }).sort({ createdAt: -1 });
        }

        res.render("admin-mess-dues", {
            dues,
            selectedCourse: course
        });
    } catch (error) {
        console.error("Mess dues error:", error);
        res.status(500).send("Error loading mess dues: " + error.message);
    }
});

app.get("/payment/:id", async (req, res) => {
    if (!req.session.student)
        return res.redirect("/student-login.html");

    const due = await MessDue.findById(req.params.id);

    if (!due || due.enrollment !== req.session.student.enrollment)
        return res.send("Unauthorized");

    res.render("payment", { due });
});
app.post("/payment/:id", async (req, res) => {
    if (!req.session.student)
        return res.redirect("/student-login.html");

    const due = await MessDue.findById(req.params.id);

    if (!due) return res.send("Invalid payment");

    // 🔐 Security check
    if (due.enrollment !== req.session.student.enrollment)
        return res.send("Unauthorized");

    // ✅ Mark as paid
    due.status = "Paid";
    due.paidOn = new Date();
    await due.save();

    // 🔔 Notification
    await Notification.create({
        enrollment: due.enrollment,
        message: `Payment successful for ${due.month} mess fees (₹${due.amount}).`
    });

    res.redirect("/mess");
});
app.get("/admin/notice", (req, res) => {
    if (!req.session.admin)
        return res.redirect("/admin-login.html");

    res.render("admin-notice");
});
app.post("/admin/notice", async (req, res) => {
    try {
        if (!req.session.admin)
            return res.redirect("/admin-login.html");

        const { title, message, target } = req.body;

        // ✅ store notice with date
        await Notice.create({
            title,
            message,
            target,
            createdAt: new Date()   // 👈 DATE STORED HERE
        });

        // 🔔 send notification to students based on target
        let students = [];

        if (target === "ALL") {
            students = await Student.find({});
        } else {
            students = await Student.find({ course: target }); // UG / PG
        }

        for (let s of students) {
            await Notification.create({
                enrollment: s.enrollment,
                message: `📢 ${title}: ${message}`,
                date: new Date()     // 👈 DATE STORED HERE ALSO
            });
        }

        res.redirect("/admin/dashboard");

    } catch (error) {
        console.error("Notice creation error:", error);
        res.status(500).send("Error creating notice: " + error.message);
    }
});




/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
