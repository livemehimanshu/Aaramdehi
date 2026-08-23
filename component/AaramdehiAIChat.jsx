import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import api from '../src/api/axiosInstance';

const welcomeMessage = 'Namaste! Main Aaramdehi Comfort Assistant hoon. Mat, pillow, towel, delivery ya home comfort ke baare mein poochhiye.';

export default function AaramdehiAIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: welcomeMessage }]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput('');
    setMessages((current) => [...current, { sender: 'user', text: message }]);
    setLoading(true);
    try {
      const response = await api.post('/ai/chat-assistant', { message });
      setMessages((current) => [...current, { sender: 'ai', text: response.data.reply, product: response.data.recommendedProduct }]);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setMessages((current) => [...current, { sender: 'ai', text: backendMessage || 'Maaf kijiye, assistant abhi unavailable hai. Aap WhatsApp par humse baat kar sakte hain.' }]);
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed inset-x-3 bottom-3 z-[900] sm:inset-x-auto sm:bottom-5 sm:left-5">
    {open ? <div className="flex h-[min(34rem,calc(100dvh-1.5rem))] max-h-[calc(100dvh-1.5rem)] w-full max-w-[23rem] flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl sm:h-[min(34rem,calc(100dvh-2.5rem))] sm:max-h-[calc(100dvh-2.5rem)]">
      <header className="flex shrink-0 items-center justify-between bg-amber-600 p-4 text-white"><div><p className="text-sm font-black">Aaramdehi AI Expert</p><p className="text-[10px] text-amber-100">Products and comfort help</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant"><FiX size={20} /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 text-sm">{messages.map((message, index) => <div key={`${message.sender}-${index}`} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}><div className={`max-w-[88%] rounded-2xl p-3 ${message.sender === 'user' ? 'rounded-br-none bg-amber-600 text-white' : 'rounded-bl-none border border-gray-200 bg-white text-gray-800'}`}>{message.text}</div>{message.product && <Link to={`/product/${message.product.id}`} onClick={() => setOpen(false)} className="mt-2 flex w-[88%] items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-2"><img src={message.product.image || 'https://placehold.co/80x80?text=Product'} alt={message.product.name} className="h-14 w-14 rounded-lg object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-gray-800">{message.product.name}</strong><span className="text-xs font-bold text-amber-700">₹{message.product.price.toLocaleString('en-IN')}</span></span><span className="text-xs font-bold text-amber-700">View</span></Link>}</div>)}{loading && <div className="w-fit rounded-2xl rounded-bl-none border border-gray-200 bg-white p-3 text-xs text-gray-500">Aaramdehi AI soch raha hai...</div>}<div ref={endRef} /></div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 bg-white p-3"><input value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Rainy season ke liye mat?" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500" /><button type="submit" disabled={loading} aria-label="Send message" className="rounded-xl bg-amber-600 px-3 text-white disabled:opacity-50"><FiSend /></button></form>
    </div> : <button type="button" onClick={() => setOpen(true)} aria-label="Open Aaramdehi AI assistant" className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-xl transition hover:scale-105 hover:bg-amber-700"><FiMessageCircle size={26} /></button>}
  </div>;
}
