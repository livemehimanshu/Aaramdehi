import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported = typeof window !== 'undefined' && Boolean(getSpeechRecognition());

  const handleCommand = useCallback((spokenText) => {
    const command = spokenText.toLowerCase().trim();
    if (/\bcart\b|cart kholo|mera cart|cart mein ja|cart me ja/.test(command)) return navigate('/cart');
    if (/wishlist|pasand kiye|pasand wale|meri pasand/.test(command)) return navigate('/wishlist');
    if (/blog|journal|article|articles padh|lekh/.test(command)) return navigate('/blog');
    if (/home|wapas ja|wapas chalo|pehle page|pahle page/.test(command)) return navigate('/');
    if (/category|categories|shreni/.test(command)) return navigate('/categories');
    if (/account|profile|mera account|meri profile/.test(command)) return navigate('/account/profile');

    const searchTerms = command
      .replace(/^(show me|find|search for|search|open|go to|dikhao|dikhaiye|dikhana|dhundho|khojo|kuch)\s+/i, '')
      .replace(/\b(please|products?|items?|dikhao|dikhaiye|dikhana|chahiye|karo|kijiye|mujhe|kuch|acche|achhe|saste|sabse|best)\b/gi, '')
      .trim();
    if (searchTerms) {
      navigate(`/products?search=${encodeURIComponent(searchTerms)}`);
      toast.success(`Showing results for “${searchTerms}”`);
    } else {
      toast('Try saying “pillow dikhao”, “cart kholo”, or “journal dikhao”.');
    }
  }, [navigate]);

  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return undefined;
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice command could not be heard. Please try again.');
    };
    recognition.onresult = (event) => handleCommand(event.results[0][0].transcript);
    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [handleCommand, location.pathname]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={listening ? 'Stop voice navigation' : 'Start voice navigation'}
      title={listening ? 'Stop listening' : 'Voice navigation'}
      className={`fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 ${listening ? 'bg-red-600' : 'bg-blue-900'}`}
    >
      {listening ? <FiMicOff size={20} /> : <FiMic size={20} />}
    </button>
  );
}
