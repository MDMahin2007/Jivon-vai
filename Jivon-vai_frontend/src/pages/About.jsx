import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { teamData } from '../data/projects';
import { FaGraduationCap, FaAward, FaBuilding } from 'react-icons/fa';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Page Header */}
        <div className="text-left mb-16">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
            ABOUT
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
            Our Company
          </h1>
          <div className="h-1 w-20 bg-primary" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Profile Card */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative p-2 bg-gradient-to-tr from-primary via-dark-card to-primary/40 rounded-sm shadow-2xl w-full max-w-[380px]"
            >
              <img
                src="/img/jibon.jpg"
                alt="Architect Jibon"
                className="w-full h-auto object-cover rounded-sm border-4 border-dark"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-dark p-4 font-heading font-bold text-xs tracking-wider z-20">
                FOUNDER & LEAD ARCHITECT
              </div>
            </motion.div>
          </div>

          {/* Company Bio */}
          <div className="text-left flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-6 tracking-wide text-white">
              Creative Vision, Executed{" "}
              <span className="text-primary">Precisely</span>
            </h2>
            <div className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed flex flex-col gap-6">
              <p>
                Welcome to <strong>Arcforma Studio</strong>. We are a dedicated
                and innovative architectural visualization company focused on
                delivering high-quality visual designs to our clients. Our goal
                is to provide reliable, efficient, 3d Architectural
                visualizer.lumion, v-ray&D5 and modern structural design
                concepts that inspire and scale.
              </p>
              <p>
                At Arcforma Studio, we believe in professionalism, creativity,
                and customer satisfaction. Our expert design team works hard to
                understand the needs of our clients and deliver results that
                exceed expectations.
              </p>
              <p>
                We specialize in Architectural Building Design, 3D Exterior &
                Interior Visualization, Modern Interior Design Solutions,
                Interior Construction & Execution, and 3D Walkthrough Animation.
                From Concept to Completion, We Deliver Excellence.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="glass-panel p-5 border-l-2 border-primary">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-primary">
                  30+
                </h3>
                <p className="text-[10px] text-gray-500 tracking-wider font-heading font-bold uppercase mt-1">
                  Projects Done
                </p>
              </div>
              <div className="glass-panel p-5 border-l-2 border-green-500">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-green-500">
                  2+ Years
                </h3>
                <p className="text-[10px] text-gray-500 tracking-wider font-heading font-bold uppercase mt-1">
                  Experience
                </p>
              </div>
              <div className="glass-panel p-5 border-l-2 border-purple-500">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-purple-500">
                  100+
                </h3>
                <p className="text-[10px] text-gray-500 tracking-wider font-heading font-bold uppercase mt-1">
                  Happy Clients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications Block */}
        <div
          id="certifications"
          className="py-16 border-t border-dark-border/20 mb-24"
        >
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
              QUALIFICATIONS
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Certifications & Standards
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary mb-6 bg-dark-card shadow-md">
                <FaGraduationCap size={20} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-3 text-white">
                Professional Degrees
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Licensed architectural planning and drafting services adhering
                to national design frameworks and standards.
              </p>
            </div>
            <div className="glass-panel p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary mb-6 bg-dark-card shadow-md">
                <FaAward size={20} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-3 text-white">
                Industry Excellence
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Awarded accolades for 3D walkthrough rendering and innovative
                commercial spatial layout solutions.
              </p>
            </div>
            <div className="glass-panel p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary mb-6 bg-dark-card shadow-md">
                <FaBuilding size={20} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-3 text-white">
                Safety Codes
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Engineering designs verified for load bearing limits, structural
                safety standards, and energy efficient ratings.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-dark-border/20 pt-16">
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">
              PEOPLE
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Our Team
            </h2>
          </div>
          <div className="flex justify-center">
            {teamData.map((member) => (
              <div
                key={member.name}
                className="glass-panel p-6 max-w-xs w-full text-center hover-glow"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 object-cover rounded-full mx-auto border-2 border-primary mb-6"
                />
                <h3 className="text-lg font-bold font-heading text-white">
                  {member.name}
                </h3>
                <p className="text-xs text-primary font-heading font-medium tracking-wider uppercase mt-1">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
