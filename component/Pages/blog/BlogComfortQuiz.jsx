import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const questions = [
  { title: 'What are you shopping for?', options: [{ label: 'Entryway protection', term: 'doormat', path: 'doormat' }, { label: 'Better sleep', term: 'pillow', path: 'pillow' }, { label: 'Soft everyday essentials', term: 'towel', path: 'towel' }] },
  { title: 'What matters most?', options: [{ label: 'Easy cleaning', term: 'washable' }, { label: 'Extra comfort', term: 'comfort' }, { label: 'Secure grip', term: 'anti skid' }] }
];

export default function BlogComfortQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const result = useMemo(() => answers.join(' '), [answers]);
  const isComplete = step >= questions.length;

  return <section className="my-12 rounded-3xl border border-blue-100 bg-blue-50/60 p-6 md:p-8" aria-labelledby="comfort-quiz-title">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Find your match</p>
    <h2 id="comfort-quiz-title" className="mt-2 text-2xl font-black text-blue-900">Which comfort essential fits your home?</h2>
    {!isComplete ? <div className="mt-6"><p className="text-sm font-bold text-gray-700">{questions[step].title}</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{questions[step].options.map((option) => <button key={option.label} type="button" onClick={() => { setAnswers([...answers, option.term]); setStep(step + 1); }} className="rounded-2xl border border-white bg-white px-4 py-4 text-left text-sm font-bold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700">{option.label}</button>)}</div><p className="mt-4 text-xs text-gray-500">Step {step + 1} of {questions.length}</p></div> : <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-gray-700">Based on your answers, explore our {result.includes('doormat') ? 'doormats' : result.includes('pillow') ? 'pillows' : 'towels'} collection.</p><Link to={`/products?search=${encodeURIComponent(result)}`} className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Shop your match</Link><button type="button" onClick={() => { setStep(0); setAnswers([]); }} className="text-xs font-bold text-blue-700">Start again</button></div>}
  </section>;
}
