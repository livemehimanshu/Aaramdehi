import React, { useState, useEffect } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';

/**
 * Sticky Bottom Banner - Shows coupon offer at the bottom of the screen
 */
export const StickyBottomBanner = ({ rule, onClose, onApplyCoupon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rule.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up border-t-4 shadow-2xl"
      style={{ backgroundColor: rule.bannerColor, borderTopColor: rule.bannerColor }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base sm:text-lg">
              {rule.bannerText || `Don't miss this offer! Get ${rule.discountValue}`}
            </p>
            <p className="text-white text-opacity-90 text-sm mt-1">
              Use code: <code className="bg-white bg-opacity-20 px-2 py-1 rounded font-mono font-bold">
                {rule.discountCode}
              </code>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm sm:text-base"
            >
              {copied ? (
                <>
                  <FiCheck size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <FiCopy size={18} />
                  Copy Code
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition"
              aria-label="Close banner"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Exit-Intent Pop-up Modal - Shows when user moves toward close/back
 */
export const ExitIntentModal = ({ rule, onClose, productName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rule.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-zoom-in">
        {/* Header */}
        <div
          className="p-6 text-white text-center"
          style={{ backgroundColor: rule.bannerColor }}
        >
          <h2 className="text-2xl font-bold">Wait! Don't leave yet 🛑</h2>
          <p className="text-white text-opacity-90 mt-2">We have a special offer just for you</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-4">
              You were viewing <strong>{productName}</strong>
            </p>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 mb-4">
              <p className="text-gray-900 text-xs font-medium text-opacity-70 mb-1">
                Exclusive Offer
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {rule.discountValue}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                {rule.bannerText || 'on this product'}
              </p>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Use Coupon Code:
            </label>
            <button
              onClick={handleCopyCode}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between group"
            >
              <code className="font-mono font-bold text-lg text-gray-900">
                {rule.discountCode}
              </code>
              {copied ? (
                <FiCheck className="text-green-600" size={20} />
              ) : (
                <FiCopy className="text-gray-500 group-hover:text-gray-700" size={20} />
              )}
            </button>
            {copied && (
              <p className="text-green-600 text-xs mt-2">✓ Copied to clipboard!</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mb-6">
            Valid for a limited time. Use at checkout.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              style={{ backgroundColor: rule.bannerColor, borderColor: rule.bannerColor }}
              className="flex-1 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            >
              Claim This Offer
            </button>
            <button
              onClick={onClose}
              className="flex-1 text-gray-700 border border-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <FiX size={24} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Top Announcement Banner
 */
export const TopAnnouncementBanner = ({ rule, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rule.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 animate-slide-down shadow-lg"
      style={{ backgroundColor: rule.bannerColor }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Animated badge */}
          <div className="flex items-center gap-2">
            <span className="inline-block bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              🎉 Special Offer
            </span>
          </div>

          {/* Message */}
          <div className="flex-1 text-white text-center font-bold text-sm sm:text-base">
            {rule.bannerText || `Get ${rule.discountValue} with code: ${rule.discountCode}`}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition flex-shrink-0"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Unified Retargeting Display Manager Component
 * This component handles all banner layouts based on rule type
 */
export const RetargetingDisplayManager = ({ rule, onClose, productName }) => {
  if (!rule) return null;

  switch (rule.bannerLayout) {
    case 'sticky-bottom':
      return <StickyBottomBanner rule={rule} onClose={onClose} />;
    case 'exit-intent':
      return <ExitIntentModal rule={rule} onClose={onClose} productName={productName} />;
    case 'top-announcement':
      return <TopAnnouncementBanner rule={rule} onClose={onClose} />;
    default:
      return <StickyBottomBanner rule={rule} onClose={onClose} />;
  }
};

export default RetargetingDisplayManager;
