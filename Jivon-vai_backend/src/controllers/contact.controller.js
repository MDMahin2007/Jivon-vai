import Contact from "../models/contact.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🌟 ১. কন্টাক্ট মেসেজ তৈরি এবং জিমেইলে পাঠানো
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!phone || phone.trim().length < 5) {
      return res.status(400).json({ success: false, message: "A valid phone number is required." });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters." });
    }

    // ডাটাবেজে সেভ করা
    const newContact = new Contact({ name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(), interest: interest?.trim() || "", message: message.trim() });
    await newContact.save();

    // নোডमেইলার কনফিগারেশন
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // মেইল পাঠানোর জন্য আপনার .env ফাইলের জিমেইল
        pass: process.env.EMAIL_PASS, // আপনার ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_RECIPIENT || process.env.EMAIL_USER,
      replyTo: email, // ইউজারকে সরাসরি রিপ্লাই দেওয়ার জন্য
      subject: `New Contact Submission from ${name}`,
      text: `
        You have a new message from your website:
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Interest: ${interest}
        Message: ${message}
      `,
    };

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && (process.env.CONTACT_RECIPIENT || process.env.EMAIL_USER)) {
      await transporter.sendMail(mailOptions);
      emailSent = true;
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS not configured. Contact message saved without sending email.");
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Message saved and email sent successfully!"
        : "Message saved successfully, but email notification is not configured.",
      data: newContact,
    });
  } catch (error) {
    console.error("Error in createContact:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🌟 ২. সব মেসেজ ডাটাবেজ থেকে তুলে নিয়ে আসার ফাংশন
export const getContacts = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🌟 ৩. মেসেজ ডিলিট করার ফাংশন (যা একটু আগে মিসিং ছিল)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Message deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteContact:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};