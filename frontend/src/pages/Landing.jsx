import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Button from '../components/Button';
import useAuthStore from '../store/authStore';
import { LANDING_STATS } from '../utils/constants';
import Logo from '../components/Logo';

const AnimatedCounter = ({ value, suffix = '' }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {value}{suffix}
    </motion.span>
  );
};

const FeatureCard = ({ icon, title, desc, color, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative"
    >
      <div className="relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden h-full transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.06]">
        {/* Glow */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-all duration-700 ${color}`} />
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 w-0 group-hover:w-full h-[2px] transition-all duration-700 ${color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '500 to-transparent')}`} />
        
        <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          {icon}
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h3>
        <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>

        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            Active Feature
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const features = [
    {
      icon: <svg className="w-7 h-7 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      title: 'Live Video Rooms', desc: 'Crystal-clear HD video calls with screen sharing, real-time presence, and zero-lag audio.', color: 'bg-cyan-500', delay: 0
    },
    {
      icon: <svg className="w-7 h-7 text-cyber-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
      title: 'Collaborative Whiteboard', desc: 'Sketch, draw, and brainstorm together on an infinite canvas with live cursors.', color: 'bg-pink-500', delay: 0.1
    },
    {
      icon: <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      title: 'Instant Team Chat', desc: 'Persistent, real-time messaging with file sharing and inline media previews.', color: 'bg-purple-500', delay: 0.2
    },
    {
      icon: <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      title: 'Smart Notes', desc: 'Write, organize, and sync personal notes. Never lose an idea during a session.', color: 'bg-green-500', delay: 0.3
    },
    {
      icon: <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
      title: 'Shared Resources', desc: 'Upload and access team files, links, and documents — always right where you need them.', color: 'bg-yellow-500', delay: 0.4
    },
    {
      icon: <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      title: 'Friends & Presence', desc: 'Build your network, see who is online, and invite friends to any room instantly.', color: 'bg-orange-500', delay: 0.5
    },
  ];

  const stats = LANDING_STATS;

  return (
    <div className="min-h-screen bg-[#050608] text-white overflow-x-hidden selection:bg-cyber-cyan/30">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyber-cyan/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyber-pink/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[200px]" />
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,243,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-16 py-8 max-w-7xl mx-auto"
      >
        <div
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Logo variant="cosmic" size="md" showText={true} />
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,243,255,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-cyber-cyan text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-glow-cyan transition-all"
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 pt-16 pb-24 px-6 max-w-6xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-5 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full backdrop-blur-xl mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-cyber-cyan opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-cyber-cyan" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyber-cyan">Platform Online — All Systems Ready</span>
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.88] mb-8"
        >
          The Future of{' '}
          <br />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink">
              Team Collaboration
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-cyber-cyan to-cyber-pink origin-left"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12"
        >
          Video rooms, real-time whiteboard, instant chat, shared notes & resources — all in one beautifully crafted workspace.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,243,255,0.6)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/register')}
            className="group px-12 py-5 bg-cyber-cyan text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-glow-cyan flex items-center gap-3 relative overflow-hidden"
          >
            <span className="relative z-10">Start Collaborating</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/login')}
            className="px-12 py-5 bg-white/[0.04] border border-white/10 rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all backdrop-blur-xl"
          >
            Sign In
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-xl text-center">
              <p className="text-2xl font-black text-cyber-cyan glow-text-cyan">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Mock UI Preview */}
      <section className="relative z-10 px-6 py-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          {/* Glow behind preview */}
          <div className="absolute inset-[-20px] bg-cyber-cyan/10 rounded-[3rem] blur-[60px]" />
          {/* Browser chrome mockup */}
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0b0d] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-4 h-7 bg-white/5 rounded-xl flex items-center px-4">
                <span className="text-[10px] text-gray-600 font-mono">app.cohive.io/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-4 h-80">
              {/* Sidebar mock */}
              <div className="col-span-1 border-r border-white/5 p-4 space-y-3 bg-[#08090b]">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/20">
                  <div className="w-5 h-5 rounded-lg bg-cyber-cyan/30" />
                  <div className="h-2 w-16 bg-cyber-cyan/40 rounded-full" />
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-2xl">
                    <div className="w-5 h-5 rounded-lg bg-white/5" />
                    <div className="h-2 bg-white/10 rounded-full" style={{ width: `${40 + i * 10}px` }} />
                  </div>
                ))}
              </div>
              {/* Main area mock */}
              <div className="col-span-3 p-5 space-y-4">
                <div className="h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center px-4 gap-3">
                  <div className="h-2 w-24 bg-white/20 rounded-full" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-20 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/30" />
                    <div className="h-8 w-20 rounded-xl bg-white/5 border border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 flex-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                      <div className="h-16 bg-gradient-to-br from-cyber-cyan/10 to-transparent" />
                      <div className="p-3 space-y-2">
                        <div className="h-2 w-20 bg-white/20 rounded-full" />
                        <div className="h-2 w-14 bg-white/10 rounded-full" />
                        <div className="flex gap-1 mt-3">
                          {[0,1,2].map(j => <div key={j} className="w-6 h-6 rounded-lg bg-white/10" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-32 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.5em] mb-4"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-black uppercase tracking-tighter"
          >
            Built for <span className="glow-text-cyan">Real Teams</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={f.delay} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative p-16 rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 via-transparent to-cyber-pink/10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent" />

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6 relative z-10"
          >
            Ready to <span className="glow-text-cyan">Collaborate?</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 font-medium mb-12 text-lg relative z-10"
          >
            Join thousands of teams already using Cohive to do their best work together.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(0,243,255,0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-14 py-5 bg-cyber-cyan text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-glow-cyan"
            >
              Create Free Account
            </motion.button>
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/20 hover:decoration-cyber-cyan"
            >
              Already have an account?
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Logo variant="cosmic" size="sm" showText={true} />
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <a href="#" className="hover:text-cyber-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyber-cyan transition-colors">Terms</a>
            <a href="#" className="hover:text-cyber-pink transition-colors">Support</a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">
            © 2026 Cohive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
