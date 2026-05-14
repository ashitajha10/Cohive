import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import Starfield from '../components/Starfield';
import Card from '../components/Card';
import Button from '../components/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState('');
  
  const navigate = useNavigate();
  const { forgotPassword } = useAuthStore();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      return showToast("Please enter a valid email address", "error");
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      showToast("Recovery email sent!", "success");
      setSent(true);
      // In this dev environment, we show the token so the user can continue the flow
      if (result.resetToken) {
        setSimulatedToken(result.resetToken);
      }
    } else {
      showToast(result.error, "error");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cyber-grey-900 relative overflow-hidden px-4">
      <Starfield />
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyber-cyan/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      
      <div className="w-full max-w-[440px] relative z-10 py-12">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="w-16 h-16 bg-gradient-to-br from-cyber-cyan to-cyber-grey-900 rounded-2xl flex items-center justify-center shadow-glow-cyan mb-6 transform hover:rotate-6 transition-transform cursor-pointer">
            <span className="text-black font-black text-3xl ">C</span>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Forgot Password</h1>
          <p className="text-gray-400 font-medium tracking-tight">Restore access to your workspace</p>
        </div>

        <Card className="p-8 md:p-10 bg-cyber-black/60 backdrop-blur-3xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent"></div>
          
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@orbit.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20 transition-all font-medium"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-4 bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-cyan transition-all flex items-center justify-center gap-2 group border-none  "
              >
                <span>Send Recovery Email</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Cancel & Return to Login
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20 shadow-glow-cyan animate-bounce">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Email Sent!</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                If an account exists for <span className="text-cyber-cyan font-black">{email}</span>, a recovery link has been sent.
              </p>
              
              {simulatedToken && (
                <div className="mt-8 p-4 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyber-cyan mb-2">Internal Link Found (Dev Mode):</p>
                  <Button 
                    variant="primary" 
                    className="w-full text-[10px] py-2 bg-cyber-cyan text-black hover:bg-cyber-cyan/90 border-none "
                    onClick={() => navigate(`/reset-password/${simulatedToken}`)}
                  >
                    Reset Password Now
                  </Button>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full border-white/10 text-white"
                onClick={() => navigate('/login')}
              >
                Return to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
