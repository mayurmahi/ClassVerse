require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Organization = require("./models/Organization");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing seed data
    await User.deleteMany({
      email: {
        $in: [
          "superadmin@classverse.com",
          "admin@classverse.com",
          "teacher@classverse.com",
          "student@classverse.com",
        ],
      },
    });
    await Organization.deleteMany({ emailDomain: "classverse.com" });

    // Create SuperAdmin — no organization needed
    const superAdminPassword = await bcrypt.hash("super123", 10);
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@classverse.com",
      password: superAdminPassword,
      role: "SuperAdmin",
      organizationId: null,
    });
    console.log("SuperAdmin created:", superAdmin.email);

    // Create demo Organization
    const org = await Organization.create({
      name: "ClassVerse Demo College",
      emailDomain: "classverse.com",
    });
    console.log("Organization created:", org.name);

    // Create demo Admin for this org
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Demo Admin",
      email: "admin@classverse.com",
      password: adminPassword,
      role: "Admin",
      organizationId: org._id,
    });

    // Update org with adminId
    await Organization.findByIdAndUpdate(org._id, { adminId: admin._id });
    console.log("Admin created:", admin.email);

    // Create demo Teacher
    const teacherPassword = await bcrypt.hash("teacher123", 10);
    await User.create({
      name: "John Teacher",
      email: "teacher@classverse.com",
      password: teacherPassword,
      role: "Teacher",
      organizationId: org._id,
    });
    console.log("Teacher created");

    // Create demo Student
    const studentPassword = await bcrypt.hash("student123", 10);
    await User.create({
      name: "Jane Student",
      email: "student@classverse.com",
      password: studentPassword,
      role: "Student",
      organizationId: org._id,
    });
    console.log("Student created");

    console.log("\nSeed completed!");
    console.log("SuperAdmin: superadmin@classverse.com / super123");
    console.log("Admin:      admin@classverse.com / admin123");
    console.log("Teacher:    teacher@classverse.com / teacher123");
    console.log("Student:    student@classverse.com / student123");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seed();