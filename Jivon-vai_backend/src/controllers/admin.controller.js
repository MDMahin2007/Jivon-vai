import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ইমেইলটি আগে থেকেই আছে কিনা চেক করা
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json(adminData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // .env ফাইলের এক্সপায়ারি টাইম ব্যবহার করা
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      token,
      admin: adminData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};