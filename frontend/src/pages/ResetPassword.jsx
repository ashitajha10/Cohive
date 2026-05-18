import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      return showToast("Password must be at least 6 characters.", "error");
    }
    if (password !== confirmPassword) {
      return showToast("Passwords do not match.", "error");
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      showToast("Password reset successful! You can now log in.", "success");
      navigate('/dashboard');
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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Reset Password</h1>
          <p className="text-gray-400 text-sm font-medium mt-2">Set your new account password.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-purple-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#7c3aed] transition-all disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
