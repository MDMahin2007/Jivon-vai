import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const TOKEN_FALLBACK_EXPIRES_IN = "1d";

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
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

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

export async function getCurrentAdmin(req, res) {
  return res.json({
    success: true,
    admin: sanitizeAdmin(req.admin),
  });
}

export async function logoutAdmin(req, res) {
  return res.json({
    success: true,
    message: "Logout successful.",
  });
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
