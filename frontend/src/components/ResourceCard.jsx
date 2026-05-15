import React from 'react';

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
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-[#1c2128] transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
      <div className="flex items-start gap-4 relative z-10 flex-1">
        <div className="w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:bg-black/80 transition-colors">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white truncate group-hover:text-cyber-cyan transition-colors" title={resource.title}>
            {resource.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-medium text-gray-400 truncate max-w-[100px]">
              {uploaderName}
            </span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="text-[11px] font-medium text-gray-500">
              {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(resource._id); }}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-colors bg-black/20 hover:bg-red-500/10 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mt-5 relative z-10">
        <button
          onClick={handleOpen}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent"
        >
          {resource.type === 'link' ? 'Open Link' : 'Download'}
        </button>
      </div>
    </div>
  );
};


export default ResourceCard;
