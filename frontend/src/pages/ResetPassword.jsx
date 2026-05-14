import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import Starfield from '../components/Starfield';
import Card from '../components/Card';
import Button from '../components/Button';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-cyber-grey-900 relative overflow-hidden px-4">
      <Starfield />
      
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyber-pink/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      
      <div className="w-full max-w-[440px] relative z-10 py-12">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="w-16 h-16 bg-gradient-to-br from-cyber-cyan to-cyber-grey-900 rounded-2xl flex items-center justify-center shadow-glow-cyan mb-6">
            <span className="text-black font-black text-3xl ">C</span>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Reset Password</h1>
          <p className="text-gray-400 font-medium tracking-tight">Set your new account password</p>
        </div>

        <Card className="p-8 md:p-10 bg-cyber-black/60 backdrop-blur-3xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-4 bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-cyan transition-all flex items-center justify-center gap-2 group border-none  "
            >
              <span>Update Password</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
