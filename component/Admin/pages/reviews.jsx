import React, { useState } from 'react';
import { Star, CheckCircle, Trash2, XCircle, ShieldCheck } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([
    { id: 1, customer: 'Himanshu S.', rating: 5, comment: 'Amazing product quality!', isApproved: true },
    { id: 2, customer: 'Neeraj S.', rating: 4, comment: 'Good value for money.', isApproved: false },
  ]);

  const toggleApproval = (id) => {
    setReviews(reviews.map(rev => 
      rev.id === id ? { ...rev, isApproved: !rev.isApproved } : rev
    ));
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(rev => rev.id !== id));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen text-gray-200">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <ShieldCheck className="text-purple-500" size={24} md:size={28} />
        <h1 className="text-xl md:text-2xl font-bold text-white">Customer Reviews</h1>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-800/50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-800/30 transition-all text-sm">
                  <td className="p-4 font-bold text-white whitespace-nowrap">{rev.customer}</td>
                  <td className="p-4 text-amber-500 flex gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                    ))}
                  </td>
                  <td className="p-4 text-gray-400 italic text-xs md:text-sm">"{rev.comment}"</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight flex w-max ${
                      rev.isApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {rev.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => toggleApproval(rev.id)} className="transition-all hover:scale-110">
                        {rev.isApproved ? <XCircle size={16} className="text-rose-400" /> : <CheckCircle size={16} className="text-emerald-400" />}
                      </button>
                      <button onClick={() => deleteReview(rev.id)} className="transition-all hover:scale-110 text-rose-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}