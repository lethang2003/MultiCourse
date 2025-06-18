import React from "react";
import { Facebook, Instagram, Twitter, Mail, PhoneCall, MapPin, ArrowRight, Globe, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 pb-8 mt-10">
      {/* Top gradient border */}
      {/* <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div> */}
      
      {/* Footer content with background image */}
      <div 
        className="relative py-16"
        style={{
          backgroundImage: "url('/apple-2562204_1280.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 to-gray-900/80 backdrop-blur-sm"></div>
        
        <div className="relative container mx-auto px-6 lg:px-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-3xl font-bold mb-3">
              <span className="text-white">Multi</span>
              <span className="text-cyan-400">Course</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              Empowering minds through quality education and innovative learning experiences
            </p>
          </div>
          
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">
                About Us
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                MultiCourse is dedicated to providing high-quality online education for learners worldwide.
                Join thousands of students in mastering new skills and advancing your career.
              </p>
              <a href="/about" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300">
                Learn more <ArrowRight size={14} className="ml-1" />
              </a>
            </div>
            
            {/* Quick links section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/courses" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center text-sm">
                    <ArrowRight size={14} className="mr-2 text-cyan-400" />
                    Courses
                  </a>
                </li>
                <li>
                  <a href="/tutors" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center text-sm">
                    <ArrowRight size={14} className="mr-2 text-cyan-400" />
                    Find Tutors
                  </a>
                </li>
                <li>
                  <a href="/testimonials" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center text-sm">
                    <ArrowRight size={14} className="mr-2 text-cyan-400" />
                    Student Success Stories
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center text-sm">
                    <ArrowRight size={14} className="mr-2 text-cyan-400" />
                    Blog & Resources
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center text-sm">
                    <ArrowRight size={14} className="mr-2 text-cyan-400" />
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin size={18} className="text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">123 Learning Street, San Francisco, CA 94103, United States</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="text-cyan-400 mr-3 flex-shrink-0" />
                  <a href="mailto:support@multicourse.com" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    support@multicourse.com
                  </a>
                </li>
                <li className="flex items-center">
                  <PhoneCall size={18} className="text-cyan-400 mr-3 flex-shrink-0" />
                  <a href="tel:+11234567890" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    +1 (123) 456-7890
                  </a>
                </li>
                <li className="flex items-center">
                  <Globe size={18} className="text-cyan-400 mr-3 flex-shrink-0" />
                  <a href="https://www.multicourse.com" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                    www.multicourse.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Clock size={18} className="text-cyan-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">Mon-Fri: 9AM - 6PM (EST)</span>
                </li>
              </ul>
            </div>
            
            {/* Newsletter section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">
                Stay Updated
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest courses, promotions and learning tips.
              </p>
              <form className="space-y-3">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                >
                  Subscribe
                </button>
              </form>
              
              {/* Social media icons */}
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">Follow us on social media:</p>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-cyan-500 transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} className="text-gray-300" />
                  </a>
                  <a 
                    href="#" 
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-cyan-500 transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} className="text-gray-300" />
                  </a>
                  <a 
                    href="#" 
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-cyan-500 transition-colors duration-300"
                    aria-label="Twitter"
                  >
                    <Twitter size={18} className="text-gray-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom footer */}
      <div className="container mx-auto px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} MultiCourse. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
              Terms of Service
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}