import crypto from 'crypto';

/**
 * @description Generates a Cryptographically Secure 6-Digit OTP
 * @returns {string} - Exactly 6 Digit OTP (padded with zeros if needed)
 */
const generatedOtp = () => {
    // Generate random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Ensure it's exactly 6 digits (should always be, but just to be safe)
    const paddedOtp = otp.padStart(6, '0');
    
    console.log(`🔐 Generated OTP: ${paddedOtp}`);
    return paddedOtp;
};

export default generatedOtp;