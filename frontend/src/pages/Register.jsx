import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../services/api';

const FloatingOrb = ({ cx, cy, size, color, duration }) => (
  <motion.div
    animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute rounded-full pointer-events-none"
    style={{ left: cx, top: cy, width: size, height: size, background: color, filter: 'blur(80px)', opacity: 0.12 }}
  />
);

const InputField = ({ label, type, name, value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{label}</label>
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-medium text-white transition-all duration-300 placeholder:text-gray-700 outline-none ${
            focused
              ? 'border-cyber-cyan/60 shadow-[0_0_20px_rgba(0,243,255,0.15)] bg-white/[0.08]'
              : 'border-white/10 hover:border-white/20'
          }`}
        />
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full origin-left"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-green-400'];
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i <= strength ? 1 : 0 }}
            className={`h-1 flex-1 rounded-full ${i <= strength ? colors[strength] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${colors[strength].replace('bg-', 'text-')}`}>
        {labels[strength]}
      </p>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { showToast } = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    if (formData.password.length < 6) {
      return showToast('Password must be at least 6 characters', 'error');
    }
    setLoading(true);
    const result = await register({ name: formData.name, email: formData.email, password: formData.password });
    if (result.success) {
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050608] relative overflow-hidden">
      <FloatingOrb cx="5%" cy="60%" size="500px" color="#ff00c8" duration={9} />
      <FloatingOrb cx="70%" cy="5%" size="400px" color="#00f3ff" duration={11} />
      <FloatingOrb cx="40%" cy="80%" size="300px" color="#6366f1" duration={7} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,243,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,243,255,0.015) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: -15, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-16 h-16 bg-gradient-to-br from-cyber-pink to-[#0a0b0d] rounded-2xl flex items-center justify-center shadow-glow-pink border border-white/20 mx-auto mb-6 cursor-pointer"
          >
            <span className="font-black text-3xl text-white">C</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Create Account</h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">Join Cohive for free</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/60 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
            <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white transition-all duration-300 placeholder:text-gray-700 outline-none focus:border-cyber-cyan/60 focus:shadow-[0_0_20px_rgba(0,243,255,0.15)] focus:bg-white/[0.08]"
                />
              </div>
              <PasswordStrength password={formData.password} />
            </div>

            <InputField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255,0,200,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 mt-2 bg-cyber-pink text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-glow-pink transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
              <motion.div className="absolute inset-0 bg-white/10" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.5 }} />
            </motion.button>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-cyan font-black hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
