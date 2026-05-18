import React from 'react';
import { BACKEND_URL } from '../services/api';

const ResourceCard = ({ resource, onDelete, canDelete }) => {
  const uploaderName = resource.uploadedBy?.displayName || resource.uploadedBy?.name || "System";

  const getIcon = () => {
    switch (resource.type) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-cyber-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-6 h-6 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'link':
        return (
          <svg className="w-6 h-6 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const handleOpen = () => {
    const targetUrl = resource.url.startsWith('/') 
      ? `${BACKEND_URL}${resource.url}` 
      : resource.url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 rounded-[2.5rem] border border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all duration-500 group relative overflow-hidden backdrop-blur-xl hover:-translate-y-1">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyber-cyan/20 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyber-pink/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-start gap-5 relative z-10">
        <div className="w-14 h-14 bg-[#050608] rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-cyber-cyan/30 group-hover:shadow-[0_0_20px_-5px_rgba(0,243,255,0.4)] transition-all duration-500 overflow-hidden">
          {resource.type === 'image' ? (
            <img 
              src={resource.url.startsWith('/') ? `${BACKEND_URL}${resource.url}` : resource.url} 
              className="w-full h-full object-cover" 
              alt={resource.title} 
            />
          ) : (
            getIcon()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-white truncate group-hover:text-cyber-cyan transition-colors uppercase tracking-tight" title={resource.title}>
            {resource.title}
          </h4>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[100px] group-hover:text-gray-400">
              {uploaderName}
            </span>
            <div className="w-1 h-1 bg-gray-700 rounded-full group-hover:bg-cyber-cyan transition-colors" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400">
              {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(resource._id); }}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-cyber-pink transition-all bg-black/40 hover:bg-cyber-pink/10 rounded-xl"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mt-6 flex gap-3 relative z-10">
        <button
          onClick={handleOpen}
          className="flex-1 bg-white/[0.03] hover:bg-cyber-cyan text-gray-400 hover:text-black hover:shadow-[0_0_20px_-5px_rgba(0,243,255,0.4)] py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border border-white/5 hover:border-transparent"
        >
          {resource.type === 'link' ? 'OPEN UPLINK' : 'DOWNLOAD ASSET'}
        </button>
      </div>

      <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <div className="w-24 h-24 rotate-12 scale-150">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};


export default ResourceCard;
