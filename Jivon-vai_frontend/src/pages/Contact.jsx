import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // লোডিং স্টেট

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // 🌟 মেইল পাঠানোর হ্যান্ডলার (Async করা হয়েছে)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    let isValid = true;

    if (!formValues.name.trim()) {
      errors.name = true;
      isValid = false;
    }
    if (!formValues.phone.trim()) {
      errors.phone = true;
      isValid = false;
    }
    if (!formValues.email.trim()) {
      errors.email = true;
      isValid = false;
    }
    if (!formValues.interest.trim()) {
      errors.interest = true;
      isValid = false;
    }
    if (!formValues.message.trim()) {
      errors.message = true;
      isValid = false;
    }

    if (isValid) {
      setLoading(true); // লোডিং শুরু
      try {
        // 🌟 আপনার ব্যাকঅ্যান্ড এক্সপ্রেস সার্ভারে ফর্ম ডেটা পাঠানো হচ্ছে
        const response = await fetch(
          "http://localhost:5000/api/contact/send-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
          },
        );

        const data = await response.json();

        if (data.success) {
          setShowPopup(true); // মেইল সফলভাবে গেলে পপআপ দেখাবে
          setFormValues({
            name: "",
            phone: "",
            email: "",
            interest: "",
            message: "",
          });
          setFormErrors({});
        } else {
          alert("সার্ভার এরর: " + (data.message || "ইমেইল পাঠানো যায়নি।"));
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
        alert(
          "ব্যাকঅ্যান্ড সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। নিশ্চিত করুন npm run dev দিয়ে ব্যাকঅ্যান্ড চালু রেখেছেন।",
        );
      } finally {
        setLoading(false); // লোডিং শেষ
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12 text-left">
        {/* Page Header */}
        <div className="text-left mb-16">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
            CONTACT
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
            Get In Touch
          </h1>
          <div className="h-1 w-20 bg-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Details & Map */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-4">
                Let's Connect and Make an Impact
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                Our inbox is always open. Whether you have a question about a
                project, wish to collaborate on interior drafts, or simply want
                to speak about design ideas, we are ready to assist.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-6 flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                  <FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase mb-1">
                    Address
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                  <FaPhone size={16} />
                </div>
                <div>
                  <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase mb-1">
                    Phone
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    +8801882111979
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase mb-1">
                    Email
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug break-all">
                    arcformastudio@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="w-full h-[300px] bg-dark-card border border-dark-border/40 overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5638.128395751125!2d90.41876783719172!3d23.78311618236074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c79705d8041d%3A0xe1bf95ab3b06a96f!2sUttar%20Badda%2C%20Dhaka%201212!5e1!3m2!1sen!2sbd!4v1776697924590!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Uttar Badda, Dhaka, Map Location"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-panel p-10 flex flex-col gap-6">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Inbox Us
            </h3>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.name
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300`}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number*"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.phone
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300`}
                />
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  placeholder="Email*"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.email
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300`}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="interest"
                  value={formValues.interest}
                  onChange={handleInputChange}
                  placeholder="Interested in"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.interest
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300`}
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={formValues.message}
                  onChange={handleInputChange}
                  placeholder="Message*"
                  rows="5"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.message
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300 resize-none`}
                />
              </div>

              {/* সাবমিট বাটন লোডিংসহ */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold py-4 transition-all duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? "SENDING..." : "SUBMIT →"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card border border-primary/20 max-w-md w-full p-8 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6">
                <FaCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white mb-2">
                Thank You!
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your message has been sent successfully.
                <br />
                We will contact you soon.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold py-3 transition-colors duration-300"
              >
                GO BACK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
