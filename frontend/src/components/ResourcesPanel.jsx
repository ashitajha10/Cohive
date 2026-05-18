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
        // Prevent duplicate rendering if we uploaded it ourselves
        setResources(prev => {
          if (prev.some(r => r._id === resource._id)) return prev;
          return [resource, ...prev];
        });
        showToast("New data uplink received", "info");
      }
    };

    const handleDeletedResource = (resourceId) => {
      setResources(prev => prev.filter(r => r._id !== resourceId));
    };

    socket.on('resource_added', handleNewResource);
    socket.on('resource_deleted', handleDeletedResource);

    return () => {
      socket.off('resource_added', handleNewResource);
      socket.off('resource_deleted', handleDeletedResource);
    };
  }, [roomId]);

  const handleDelete = async (resourceId) => {
    try {
      await api.delete(`/resources/${resourceId}`);
      setResources(prev => prev.filter(r => r._id !== resourceId));
      socket.emit('resource_deleted', { roomId, resourceId });
      showToast("Data purged successfully", "success");
    } catch (err) {
      showToast("Data purge failure", "error");
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#050608]/40"><div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin shadow-glow-cyan"></div></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050608]/40 overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter glow-text-cyan">Mission Storage</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
            <span className="text-[9px] sm:text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em]">SYNCED ASSETS</span>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-800" />
            <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">{resources.length} ITEMS FOUND</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto justify-center px-6 py-4 sm:px-8 sm:py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-glow-cyan transition-all flex items-center gap-3 hover:bg-cyber-cyan"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          New Uplink
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {resources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] p-12 rounded-[4rem] border border-dashed border-white/10"
            >
              <img src="/space_mascot_astronaut_1778492786001.png" className="w-32 h-32 mx-auto mb-8 opacity-20 grayscale" alt="" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Storage Empty</h3>
              <p className="text-gray-600 font-black uppercase tracking-[0.2em] text-[9px] max-w-xs mx-auto">No collaborative assets have been synchronized in this mission sector yet.</p>
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
        onResourceAdded={(newResource) => {
          setResources(prev => [newResource, ...prev]);
          socket.emit('resource_added', { roomId, resource: newResource });
        }}
      />
    </div>
  );
};


export default ResourcesPanel;
