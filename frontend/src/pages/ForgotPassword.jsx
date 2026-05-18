import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';
  const initialSent = location.state?.sent || false;

  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(initialSent);
  
  const { forgotPassword } = useAuthStore();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return showToast("Please enter a valid email address", "error");
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      showToast("Recovery email sent!", "success");
      setSent(true);
    } else {
      showToast(result.error, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-100/50 rounded-full blur-[120px] -ml-20 -mt-20" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-blue-50/50 rounded-full blur-[100px] -mr-20 -mb-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo variant="purple" size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Forgot Password</h1>
          <p className="text-gray-400 text-sm font-medium mt-2">Restore access to your Cohive workspace.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-purple-50">
          {!prefilledEmail ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto border border-purple-100 shadow-xl shadow-purple-50">
                <svg className="w-10 h-10 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Security Check</h2>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                To request a recovery link, please enter your email address on the Login screen first, then select "Forgot Password".
              </p>
              
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#7c3aed] transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : !sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-500 cursor-not-allowed outline-none transition-all"
                />
                <p className="text-[10px] font-medium text-gray-400 ml-1">Locking recovery request to your active login email.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#7c3aed] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Recovery Email"}
              </button>

              <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                <Link to="/login" className="text-[#8b5cf6] font-bold hover:underline">
                  Cancel & Return to Login
                </Link>
              </p>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto border border-purple-100 shadow-xl shadow-purple-50">
                <svg className="w-10 h-10 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                If an account exists for <span className="text-[#8b5cf6] font-bold">{email}</span>, a secure password recovery link has been dispatched to your inbox.
              </p>
              
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#7c3aed] transition-all"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
