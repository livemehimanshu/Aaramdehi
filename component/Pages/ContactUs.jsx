import React, { useState } from 'react';
import SEO from '../header/SEO';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <SEO 
        title="Contact Us | Aaramdehi" 
        description="Get in touch with Aaramdehi for support, inquiries, and more."
      />
      
      {/* Hero Section */}
      <div className="bg-[#1A365D] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90">
          We'd love to hear from you. Reach out with any questions or feedback.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif text-[#1A365D] mb-6">Get In Touch</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Whether you're looking for the perfect mattress, have a question about an order, or just want to say hello, our team is here to help.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                <FiMail size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-[#1A365D] font-bold">support@aaramdehi.co.in</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
                <FiPhone size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-[#1A365D] font-bold">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-amber-50 p-4 rounded-full text-amber-600">
                <FiMapPin size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Office</p>
                <p className="text-[#1A365D] font-bold">New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-serif text-[#1A365D] mb-8">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A365D] focus:bg-white transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A365D] focus:bg-white transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea 
                required
                rows="4"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A365D] focus:bg-white transition-colors resize-none"
                placeholder="How can we help you today?"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#1A365D] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2a4365] transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
