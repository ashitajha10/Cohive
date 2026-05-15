import React, { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import ResourceCard from './ResourceCard';
import AddResourceModal from './AddResourceModal';

const ResourcesPanel = ({ roomId, user, room }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchResources = async () => {
    try {
      const res = await api.get(`/resources/${roomId}`);
      setResources(res.data);
    } catch (err) {
      showToast("Storage scan failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    const handleNewResource = (resource) => {
      if (resource.roomId === roomId) {
        setResources(prev => [resource, ...prev]);
        showToast("New data uplink received", "info");
      }
    };

    const handleDeletedResource = (resourceId) => {
      setResources(prev => prev.filter(r => r._id !== resourceId));
    };

    socket.on('new_resource', handleNewResource);
    socket.on('resource_deleted', handleDeletedResource);

    return () => {
      socket.off('new_resource', handleNewResource);
      socket.off('resource_deleted', handleDeletedResource);
    };
  }, [roomId]);

  const handleDelete = async (resourceId) => {
    try {
      await api.delete(`/resources/${resourceId}`);
      showToast("Data purged successfully", "success");
    } catch (err) {
      showToast("Data purge failure", "error");
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#050608]/40"><div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin shadow-glow-cyan"></div></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-6 sm:px-8 sm:py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Mission Storage</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{resources.length} ITEMS FOUND</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto justify-center px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-semibold text-sm transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Resource
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
        {resources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161b22]/50 p-12 rounded-3xl border border-white/5 backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Storage Empty</h3>
              <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">No collaborative assets have been synchronized in this mission sector yet.</p>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8"
          >
            {resources.map((resource) => (
              <motion.div
                key={resource._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <ResourceCard 
                  resource={resource} 
                  canDelete={resource.userId === user._id || (typeof room.createdBy === 'object' ? room.createdBy._id : room.createdBy) === user._id}
                  onDelete={() => handleDelete(resource._id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AddResourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        roomId={roomId} 
        onSuccess={fetchResources}
      />
    </div>
  );
};


export default ResourcesPanel;
