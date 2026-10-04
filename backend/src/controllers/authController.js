import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

const TOKEN_FALLBACK_EXPIRES_IN = "1d";
const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes

function createToken(adminId, rememberMe = false) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : process.env.JWT_EXPIRES_IN || TOKEN_FALLBACK_EXPIRES_IN,
  });
}

function sanitizeAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function validateRegisterInput({ name, email, password }) {
  if (!name || !email || !password) {
    return "Name, email, and password are required.";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (!validateEmail(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!validateEmail(email)) {
    return "Please provide a valid email address.";
  }

  return null;
}

function validateResetPasswordInput({ password }) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

async function sendResetEmail(admin, resetUrl) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_USER,
    to: admin.email,
    subject: "Arcforma Studio password reset request",
    text: `Hello ${admin.name},\n\nWe received a request to reset your Arcforma Studio admin password. Use the link below to reset it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this message.\n\nThanks,\nArcforma Studio Team`,
  };

  await transporter.sendMail(message);
  return true;
}

export async function registerAdmin(req, res, next) {
  try {
    const validationError = validateRegisterInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Admin account already configured.",
      });
    }

    const { name, email, password, rememberMe = true } = req.body;
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });
    const token = createToken(admin._id, rememberMe);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const validationError = validateLoginInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { email, password, rememberMe = false } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = createToken(admin._id, rememberMe);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentAdmin(req, res, next) {
  try {
    return res.json({
      success: true,
      admin: sanitizeAdmin(req.admin),
    });
  } catch (error) {
    return next(error);
  }
}

export async function logoutAdmin(req, res) {
  return res.json({
    success: true,
    message: "Logout successful.",
  });
}

export async function deleteCurrentAdmin(req, res, next) {
  try {
    await Admin.findByIdAndDelete(req.admin._id);
    return res.json({
      success: true,
      message: "Admin account deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkAdminExists(req, res, next) {
  try {
    const exists = (await Admin.estimatedDocumentCount()) > 0;

    return res.json({
      success: true,
      exists,
      message: exists ? "Admin account already configured." : "No admin account configured.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.json({
        success: true,
        message: "If the email is registered, password reset instructions will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    admin.resetPasswordToken = resetTokenHash;
    admin.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRES_MS;
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/admin/reset-password/${resetToken}`;
    const emailSent = await sendResetEmail(admin, resetUrl).catch(() => false);

    return res.json({
      success: true,
      message: emailSent
        ? "Password reset instructions were sent to your email."
        : "Password reset link created. Use the link provided to reset your password.",
      resetUrl: emailSent ? undefined : resetUrl,
      emailSent,
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Reset token is required." });
    }

    const validationError = validateResetPasswordInput({ password });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    admin.password = await bcrypt.hash(password, 12);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    const newToken = createToken(admin._id, false);

    return res.json({
      success: true,
      message: "Password reset successfully.",
      token: newToken,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    return next(error);
  }
}

