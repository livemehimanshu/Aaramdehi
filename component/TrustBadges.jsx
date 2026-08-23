import React from 'react';
import { FiCheckCircle, FiMapPin, FiTruck } from 'react-icons/fi';

export default function TrustBadges({ compact = false }) {
  return <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-3'}`}>
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-800"><FiTruck size={18} /> Fast shipping across India</div>
    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-800"><FiMapPin size={18} /> Made for Indian homes</div>
    <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold text-amber-800"><FiCheckCircle size={18} /> Quality checked</div>
  </div>;
}
