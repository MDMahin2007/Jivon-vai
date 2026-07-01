import React, { useEffect, useMemo, useState } from "react";
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

export default function Home() {
  const navigate = useNavigate();

  // Hero Carousel state
  const heroSlides = [
    {
      image: "/img/project-12/Scene 2.png",
      title: "Structural Elegance",
      subtitle: "FEATURED PROJECT",
      description:
        "At Arcforma Studio, we combine physical structure with visual intelligence to create breathtaking architectural solutions.",
    },
    {
      image: "/img/project-1/Scene 25_1.png",
      title: "Luxury Residential Duplex",
      subtitle: "RESIDENTIAL",
      description:
        "Clean modern layouts, smart lighting systems, and high-end materials selected for functional, high-density comfort.",
    },
    {
      image: "/img/project-9/Scene 5.png",
      title: "Corporate Headquarters",
      subtitle: "COMMERCIAL",
      description:
        "Bespoke architectural execution and interior zoning representing sleek professional productivity.",
    },
    {
      image: "/img/project-3/Scene 7_1.png",
      title: "Sustainable Villa Blueprint",
      subtitle: "SITE PLANNING",
      description:
        "Detail-oriented space utilization and exterior concepts tailored for architectural sustainability.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

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

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects");
        const data = await response.json();
        if (data.success) {
          setProjects(data.data || []);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    const loadServices = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/services");
        const data = await response.json();
        if (data.success) {
          setServices(data.data || []);
        }
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    void loadProjects();
    void loadServices();
  }, []);

  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured).slice(0, 5),
    [projects],
  );

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
  const [loading, setLoading] = useState(false); // 🌟 লোডিং স্টেট যুক্ত করা হয়েছে

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
        // 🌟 ব্যাকঅ্যান্ড এক্সপ্রেস সার্ভারে হোমপেজের ফর্ম ডেটা পাঠানো হচ্ছে
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
          setShowPopup(true); // সাকসেস পপআপ দেখাবে
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
        console.error("Error sending home contact form:", error);
        alert(
          "ব্যাকঅ্যান্ড সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। নিশ্চিত করুন আপনার ব্যাকঅ্যান্ড পোর্ট ৫০00-এ চালু আছে।",
        );
      } finally {
        setLoading(false); // লোডিং শেষ
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="relative">
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
      <section className="py-24 bg-dark relative bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images Grid Stack */}
          <div className="relative flex justify-center h-[450px]">
            <img
              src="/img/project-3/Scene 7_1.png"
              alt="Arcforma 1"
              className="absolute left-0 bottom-4 w-2/3 h-2/3 object-cover shadow-2xl border border-dark-border/40 hover:scale-105 transition-transform duration-500 z-20"
            />
            <img
              src="/img/project-5/Scene 2(1).png"
              alt="Arcforma 2"
              className="absolute right-4 top-4 w-2/3 h-2/3 object-cover shadow-2xl border border-dark-border/40 hover:scale-105 transition-transform duration-500 z-10"
            />
            <img
              src="/img/project-11/1 (2).png"
              alt="Arcforma 3"
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
              and innovative architectural visualization company focused on
              delivering high-quality visual designs to our clients. Our goal is
              to provide reliable, efficient, and modern structural design
              concepts that inspire and scale.
            </p>
            <p className="text-gray-400 font-sans leading-relaxed mb-8 text-sm sm:text-base">
              At Arcforma Studio, we believe in professionalism, creativity, and
              customer satisfaction. Our expert design team works tirelessly to
              map blueprints into cinematic 3D environments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/about"
                className="border border-primary text-primary hover:bg-primary hover:text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
              >
                READ MORE &rarr;
              </Link>
              <Link
                to="/about#certifications"
                className="bg-dark-card border border-dark-border/40 hover:border-primary text-white font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
              >
                CERTIFICATIONS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-dark-accent border-t border-dark-border/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
            SERVICES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-16 tracking-wide text-white">
            Solutions We Provide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 flex flex-col items-start text-left hover-glow">
              <h3 className="text-xl font-bold font-heading mb-4 text-white">
                Visual Design
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                From structural concepts to hyper-realistic walkthrough
                animations, we deliver unmatched drafting excellence.
              </p>
              <ul className="text-xs text-gray-500 flex flex-col gap-2 font-heading font-medium">
                <li className="flex items-center gap-2">
                  <FaCheck className="text-primary" /> Architectural Building
                  Design
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-primary" /> 3D Exterior & Interior
                  Renders
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-primary" /> Modern Space Planning
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-primary" /> Walkthrough Video
                  Production
                </li>
              </ul>
            </div>

            {!loadingServices &&
              services.slice(0, 2).map((service) => (
                <div
                  key={service.id}
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
              ))}
          </div>

          <div className="mt-16 flex justify-center gap-4">
            <Link
              to="/running-project"
              className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
            >
              RUNNING PROJECT
            </Link>
            <Link
              to="/contact"
              className="border border-white/20 hover:border-primary text-white font-heading text-xs tracking-widest font-bold px-8 py-4 transition-all duration-300"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="py-24 bg-dark">
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
            {!loadingProjects &&
              featuredProjects.map((project, idx) => {
                const gridSpan =
                  idx === 0 || idx === 1
                    ? "md:col-span-6 h-[400px]"
                    : "md:col-span-4 h-[300px]";
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className={`group relative overflow-hidden bg-dark-card border border-dark-border/40 cursor-pointer ${gridSpan}`}
                  >
                    <img
                      src={project.coverImage}
                      alt={project.title}
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
      <section className="py-24 bg-dark-accent border-t border-dark-border/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Info and Form Header */}
            <div className="text-left">
              <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
                CONTACT US
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-8 tracking-wide text-white">
                Start a Project
              </h2>
              <p className="text-gray-400 font-sans leading-relaxed mb-8 max-w-md">
                Have a design concept or a complex architectural mapping job?
                Get in touch with our team today and receive a detailed project
                outline.
              </p>
              <div className="flex flex-col gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase">
                      Location
                    </h4>
                    <p className="text-xs">Dhaka, Bangladesh</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                    <FaPhone size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase">
                      Phone
                    </h4>
                    <p className="text-xs">+8801882111979</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary">
                    <FaEnvelope size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs tracking-wider font-heading font-bold text-white uppercase">
                      Email
                    </h4>
                    <p className="text-xs">arcformastudio@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleFormSubmit}
              className="glass-panel p-10 flex flex-col gap-4"
            >
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
                  rows="4"
                  className={`w-full bg-dark/60 text-white border ${
                    formErrors.message
                      ? "border-red-500"
                      : "border-dark-border/60 focus:border-primary"
                  } px-5 py-4 text-sm focus:outline-none transition-colors duration-300 resize-none`}
                />
              </div>

              {/* 🌟 সাবমিট বাটন লোডিংসহ আপডেট করা হয়েছে */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-dark font-heading text-xs tracking-widest font-bold py-4 transition-all duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? "SENDING EMAIL..." : "SEND EMAIL →"}
              </button>
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
