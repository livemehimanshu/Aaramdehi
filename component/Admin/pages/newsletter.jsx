import React, { useState } from 'react';
import { Mail, Users, Send } from 'lucide-react';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([
    { id: 1, email: 'himanshu@example.com', date: '2026-04-10' },
    { id: 2, email: 'neeraj@example.com', date: '2026-04-12' },
  ]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const sendNewsletter = () => {
    alert(`Newsletter Sent: ${subject}`);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">Newsletter Management</h1>

      {/* Grid: Mobile (1 column), Desktop (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Compose Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
            <Mail size={20} className="text-blue-500" /> Compose Email
          </h2>
          <input 
            value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 mb-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-white transition-all text-sm md:text-base" 
            placeholder="Email Subject" 
          />
          <textarea 
            value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 mb-6 bg-gray-950 border border-gray-800 rounded-xl h-40 md:h-48 focus:border-blue-500 outline-none text-white transition-all text-sm md:text-base resize-none" 
            placeholder="Write your message here..." 
          />
          <button 
            onClick={sendNewsletter} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Send size={18} /> Send to All Subscribers
          </button>
        </div>

        {/* Subscribers Section */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
            <Users size={20} className="text-emerald-500" /> Subscribers ({subscribers.length})
          </h2>
          <div className="max-h-[350px] overflow-y-auto">
            <ul className="divide-y divide-gray-800">
              {subscribers.map((sub) => (
                <li key={sub.id} className="py-4 flex justify-between items-center hover:bg-gray-800/30 px-2 rounded-lg transition-all text-sm md:text-base">
                  <span className="text-gray-200 truncate pr-4">{sub.email}</span>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono shrink-0">{sub.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}