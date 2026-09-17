import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaBehance,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-dark-accent border-t border-dark-border/40 py-16 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-2xl font-bold tracking-wider text-white">
            Jivon <span className="text-primary">Vai</span>
          </h4>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Designing refined living, work, and public spaces through thoughtful
            architecture, immersive 3D visualization, and precise execution.
          </p>
        </div>

        <div>
          <h5 className="text-white font-heading text-sm tracking-widest font-semibold mb-6">
            INFORMATION
          </h5>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-primary transition-colors duration-300"
              >
                Menu / Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-primary transition-colors duration-300"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/gallery"
                className="hover:text-primary transition-colors duration-300"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="hover:text-primary transition-colors duration-300"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="hover:text-primary transition-colors duration-300"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/running-project"
                className="hover:text-primary transition-colors duration-300 text-primary/80"
              >
                Running Project
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h5 className="text-white font-heading text-sm tracking-widest font-semibold mb-6">
            CONTACTS
          </h5>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="leading-relaxed">Dhaka, Bangladesh</li>
            <li>+8801882111979</li>
            <li>
              <a
                href="mailto:arcformastudio@gmail.com"
                className="hover:text-primary transition-colors duration-300"
              >
                arcformastudio@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h5 className="text-white font-heading text-sm tracking-widest font-semibold mb-6">
            SOCIAL MEDIA
          </h5>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/ArcformaStudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white hover:text-dark hover:bg-primary hover:border-primary transition-all duration-300"
              aria-label="Facebook"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="https://www.behance.net/armanhosenjibon19"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white hover:text-dark hover:bg-primary hover:border-primary transition-all duration-300"
              aria-label="Behance"
            >
              <FaBehance size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white hover:text-dark hover:bg-primary hover:border-primary transition-all duration-300"
              aria-label="Instagram"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white hover:text-dark hover:bg-primary hover:border-primary transition-all duration-300"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-dark-border/20 text-center text-xs text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} Jivon Vai Studio. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}
