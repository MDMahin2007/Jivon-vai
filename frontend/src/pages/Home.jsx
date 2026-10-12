import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaCheck,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { projectsData, servicesData } from "../data/projects";
import { API_BASE_URL } from "../services/apiConfig";

export default function Home() {
  const navigate = useNavigate();

  // Hero Carousel state
  const heroSlides = [
    {
      image: "/projects/project-12/Scene 2.webp",
      title: "Structural Elegance",
      subtitle: "FEATURED PROJECT",
      description:
        "At Arcforma Studio, we combine thoughtful structure with visual precision to create inspiring architectural experiences.",
    },
    {
      image: "/projects/project-1/Scene 25_1.webp",
      title: "Luxury Residential Duplex",
      subtitle: "RESIDENTIAL",
      description:
        "Clean modern layouts, smart lighting systems, and high-end materials selected for functional, high-density comfort.",
    },
    {
      image: "/projects/project-9/Scene 5.webp",
      title: "Corporate Headquarters",
      subtitle: "COMMERCIAL",
      description:
        "Bespoke architectural execution and interior zoning representing sleek professional productivity.",
    },
    {
      image: "/projects/project-3/Scene 7_1.webp",
      title: "Sustainable Villa Blueprint",
      subtitle: "SITE PLANNING",
      description:
        "Detail-oriented space utilization and exterior concepts tailored for architectural sustainability.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const featuredProjects = projectsData
    .filter((project) => project.featured)
    .slice(0, 5);

  // Form State
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [emailNotification, setEmailNotification] = useState("pending");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false); // 🌟 লোডিং স্টেট যুক্ত করা হয়েছে

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
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
    if (!formValues.message.trim()) {
      errors.message = true;
      isValid = false;
    }

    if (isValid) {
      setLoading(true); // লোডিং শুরু
      setSubmitError("");
      try {
        // 🌟 ব্যাকঅ্যান্ড এক্সপ্রেস সার্ভারে হোমপেজের ফর্ম ডেটা পাঠানো হচ্ছে
        const response = await fetch(`${API_BASE_URL}/contact/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formValues),
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.success) {
          setEmailNotification(data.emailNotification || "pending");
          setShowPopup(true);
          setFormValues({
            name: "",
            phone: "",
            email: "",
            interest: "",
            message: "",
          });
          setFormErrors({});
        } else {
          throw new Error(
            data?.message ||
              `Message could not be sent (HTTP ${response.status}).`,
          );
        }
      } catch (error) {
        console.error("Error sending home contact form:", error);
        setSubmitError(
          error.message || "Message could not be sent. Please try again later.",
        );
      } finally {
        setLoading(false); // লোডিং শেষ
      }
    } else {
      setFormErrors(errors);
      setSubmitError("Please complete your name, phone, email, and message.");
    }
  };

  return (
    <div className="relative scroll-mt-24" id="home">
      {/* Hero Carousel */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent z-10" />
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              fetchPriority={currentSlide === 0 ? "high" : "auto"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Content */}
        <div className="absolute inset-0 z-20 flex items-center max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3 uppercase"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight font-heading"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm sm:text-lg text-gray-300 font-sans leading-relaxed mb-8"
            >
              {heroSlides[currentSlide].description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4"
            >
              <Link
                to="/projects"
                className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 rounded-none transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                VIEW PROJECTS &rarr;
              </Link>

              <Link
                to="/#contact"
                className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 rounded-none transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                CONTACT US &rarr;
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center border border-white/20 hover:border-primary text-white hover:text-primary transition-colors duration-300 rounded-none bg-dark/30"
          aria-label="Previous slide"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center border border-white/20 hover:border-primary text-white hover:text-primary transition-colors duration-300 rounded-none bg-dark/30"
          aria-label="Next slide"
        >
          <FaChevronRight size={16} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-24 scroll-mt-24 bg-dark relative bg-grid-pattern"
        id="about"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images Grid Stack */}
          <div className="relative flex justify-center h-[450px]">
            <img
              src="/projects/project-3/Scene 7_1.webp"
              alt="Arcforma Studio residential concept"
              loading="lazy"
              decoding="async"
              className="absolute left-0 bottom-4 w-2/3 h-2/3 object-cover shadow-2xl border border-dark-border/40 hover:scale-105 transition-transform duration-500 z-20"
            />
            <img
              src="/projects/project-5/Scene 2(1).webp"
              alt="Arcforma Studio interior design concept"
              loading="lazy"
              decoding="async"
              className="absolute right-4 top-4 w-2/3 h-2/3 object-cover shadow-2xl border border-dark-border/40 hover:scale-105 transition-transform duration-500 z-10"
            />
            <img
              src="/projects/project-11/1 (2).webp"
              alt="Arcforma Studio exterior facade concept"
              loading="lazy"
              decoding="async"
              className="absolute left-[15%] top-[25%] w-1/2 h-1/2 object-cover shadow-2xl border border-dark-border/40 hover:scale-105 transition-transform duration-500 z-30"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-start text-left">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
              ABOUT US
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-6 tracking-wide text-white">
              Arcforma Studio
            </h2>
            <p className="text-gray-400 font-sans leading-relaxed mb-6 text-sm sm:text-base">
              Welcome to <strong>Arcforma Studio</strong>. We are a dedicated
              architectural and interior design practice focused on thoughtful
              planning, premium detailing, and confident execution from concept
              to completion.
            </p>
            <p className="text-gray-400 font-sans leading-relaxed mb-8 text-sm sm:text-base">
              At Arcforma Studio, we believe in precision, creativity, and a
              human-centered design process. Our team turns ideas into spaces
              that are elegant, practical, and built to last.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/about"
                className="border border-primary text-primary hover:bg-primary hover:text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
              >
                READ MORE &rarr;
              </Link>
              <Link
                to="/running-project"
                className="bg-dark-card border border-dark-border/40 hover:border-primary text-white font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
              >
                RUNNING PROJECTS &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-24 scroll-mt-24 bg-dark-accent border-t border-dark-border/10"
        id="services"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
            Elevating Spaces with Elegance & Precision From Concept to
            Completion We Deliver Excellence.
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-16 tracking-wide text-white">
            Our Services
          </h2>
          <Link
            to="/services"
            className="ml-auto text-xs text-primary font-heading font-bold hover:underline tracking-widest mt-4 md:mt-0 uppercase"
          >
            ALL SERVICES &rarr;
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicesData.slice(0, 5).map((service) => {
              const serviceId = service._id || service.id;
              return (
                <div
                  key={serviceId}
                  className="glass-panel p-10 flex flex-col items-start text-left hover-glow"
                >
                  <h3 className="text-xl font-bold font-heading mb-4 text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link
                    to="/services"
                    className="text-xs text-primary font-heading font-bold hover:underline tracking-widest mt-auto uppercase"
                  >
                    LEARN DETAILS &rarr;
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-center gap-4">
            <Link
              to="/gallery"
              className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
            >
              OUR GALLERY
            </Link>
            <Link
              to="/#contact"
              className="border border-white/20 hover:border-primary text-white font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="py-24 scroll-mt-24 bg-dark" id="projects">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="text-left">
              <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
                WORK
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-wide text-white">
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-xs text-primary font-heading font-bold hover:underline tracking-widest mt-4 md:mt-0 uppercase"
            >
              ALL PROJECTS &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {featuredProjects.map((project, idx) => {
              const projectId = project._id || project.id;
              const gridSpan =
                idx === 0 || idx === 1
                  ? "md:col-span-6 h-[400px]"
                  : "md:col-span-4 h-[300px]";
              return (
                <div
                  key={projectId}
                  onClick={() => navigate(`/project/${projectId}`)}
                  className={`group relative overflow-hidden bg-dark-card border border-dark-border/40 cursor-pointer ${gridSpan}`}
                >
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-left z-20">
                    <p className="text-primary text-[10px] tracking-widest font-heading font-bold uppercase mb-1">
                      {project.category}
                    </p>
                    <h3 className="text-lg font-bold font-heading text-white group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </h3>
                  </div>

                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark/80 border border-primary/40 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button>
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        className="scroll-mt-24 border-t border-dark-border/20 bg-gradient-to-b from-dark-accent to-dark py-24"
        id="contact"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl text-left">
            <p className="mb-3 font-heading text-xs font-bold tracking-[0.3em] text-primary">
              LET&apos;S TALK
            </p>
            <h2 className="mb-4 font-heading text-3xl font-bold tracking-wide text-dark sm:text-4xl">
              Start a Project
            </h2>
            <p className="max-w-xl font-sans text-sm leading-relaxed text-dark-400 sm:text-base">
              Tell us what you&apos;re planning. Our team will review your
              enquiry and get back to you as soon as possible.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            {/* Info and Form Header */}
            <div className="text-left">
              <h3 className="mb-3 font-heading text-lg font-semibold text-dark-400 sm:text-xl">
                A good place to start
              </h3>
              <p className="mb-8 max-w-md font-sans text-sm leading-relaxed text-dark-400">
                Share a little about your space, timeline, or design goals.
                We&apos;ll help you shape the next steps.
              </p>
              <div className="flex flex-col gap-5 text-sm text-dark-400">
                <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div>
                    <h4 className="mb-1 font-heading text-xs font-bold uppercase tracking-wider text-red-500">
                      Location
                    </h4>
                    <p className="text-xs">Dhaka, Bangladesh</p>
                  </div>
                </div>
                <a
                  href="tel:+8801882111979"
                  className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                    <FaPhone size={16} />
                  </div>
                  <div>
                    <h4 className="mb-1 font-heading text-xs font-bold uppercase tracking-wider text-red-500">
                      Phone
                    </h4>
                    <p className="text-xs">+8801882111979</p>
                  </div>
                </a>
                <a
                  href="mailto:arcjibon750@gmail.com"
                  className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                    <FaEnvelope size={16} />
                  </div>
                  <div>
                    <h4 className="mb-1 font-heading text-xs font-bold uppercase tracking-wider text-red-500">
                      Email
                    </h4>
                    <p className="text-xs">arcjibon750@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleFormSubmit}
              className="glass-panel flex flex-col gap-5 rounded-xl border border-white/10 bg-[#111714]/90 p-6 shadow-2xl shadow-black/20 sm:p-8"
            >
              <div className="mb-1 border-b border-white/10 pb-5">
                <h3 className="font-heading text-lg font-semibold text-white">
                  Project enquiry
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Fields marked with * are required.
                </p>
              </div>
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-xs font-medium text-gray-300"
                >
                  Your name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                  required
                  minLength={2}
                  placeholder="e.g. Jibon Ahmed"
                  className={`w-full rounded-md border bg-dark/60 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    formErrors.name
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } transition-colors duration-200`}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-xs font-medium text-gray-300"
                  >
                    Phone number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    required
                    minLength={5}
                    placeholder="+880..."
                    className={`w-full rounded-md border bg-dark/60 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      formErrors.phone
                        ? "border-red-500"
                        : "border-dark-border/60 focus:border-primary"
                    } transition-colors duration-200`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-medium text-gray-300"
                  >
                    Email address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className={`w-full rounded-md border bg-dark/60 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      formErrors.email
                        ? "border-red-500"
                        : "border-dark-border/60 focus:border-primary"
                    } transition-colors duration-200`}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-interest"
                  className="mb-2 block text-xs font-medium text-gray-300"
                >
                  What can we help with?
                </label>
                <input
                  id="contact-interest"
                  type="text"
                  name="interest"
                  value={formValues.interest}
                  onChange={handleInputChange}
                  placeholder="Architecture, interior design, 3D visualization..."
                  className={`w-full rounded-md border bg-dark/60 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    formErrors.interest
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } transition-colors duration-200`}
                />
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-xs font-medium text-gray-300"
                >
                  Tell us about your project *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formValues.message}
                  onChange={handleInputChange}
                  placeholder="A few details about your project, goals, or timeline..."
                  rows={5}
                  required
                  minLength={10}
                  className={`w-full resize-y rounded-md border bg-dark/60 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    formErrors.message
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } transition-colors duration-200`}
                />
              </div>

              {submitError && (
                <p
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 font-heading text-xs font-bold tracking-[0.16em] text-dark shadow-lg shadow-primary/10 transition-all duration-200 hover:bg-primary-hover hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-dark/30 border-t-dark"
                      aria-hidden="true"
                    />
                    SAVING YOUR MESSAGE...
                  </>
                ) : (
                  "SEND PROJECT ENQUIRY →"
                )}
              </button>
              <p className="text-center text-[11px] text-gray-500">
                We&apos;ll use your details only to respond to this enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

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
              <h3 className="text-2xl font-bold font-heading text-black mb-2">
                Thank You!
              </h3>
              <p className="text-black/70 text-sm leading-relaxed mb-6">
                {emailNotification === "pending"
                  ? "Your enquiry is saved securely and queued for email delivery. We will contact you soon."
                  : emailNotification === "not_configured"
                    ? "Your enquiry is saved, but email notifications are temporarily unavailable. Please contact us directly."
                    : "Your enquiry has been sent successfully. We will contact you soon."}
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
