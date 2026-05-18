import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { BACKEND_URL } from '../services/api';
import Logo from '../components/Logo';

const InputField = ({ label, type, name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-300"
    />
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, token } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return showToast('Passwords do not match', 'error');
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-100/50 rounded-full blur-[120px] -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-50/50 rounded-full blur-[100px] -ml-20 -mb-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo variant="purple" size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Join Cohive</h1>
          <p className="text-gray-400 text-sm font-medium mt-2">Start collaborating with your team today.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-purple-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
            <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            <InputField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:bg-[#7c3aed] transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#8b5cf6] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
