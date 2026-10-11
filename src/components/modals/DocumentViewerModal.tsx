import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bookmark, ExternalLink, FileText, Share2 } from 'lucide-react';

export const DocumentViewerModal: React.FC = () => {
  const { activeResource, setActiveResource, triggerHaptic } = useApp();

  if (!activeResource) return null;

  const fileUrl = activeResource.file_path || activeResource.download_url || '/downloads/Statistical_Tables.pdf';

  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeResource.title,
          text: `Study ${activeResource.title} on NASS Department of Statistics UNIZIK Portal.`,
          url: fileUrl
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between">
      {/* Viewer Header */}
      <div className="bg-[#061226] border-b border-blue-900/50 p-3.5 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white truncate">
              {activeResource.title}
            </h3>
            <p className="text-[10px] text-slate-300 truncate">
              {activeResource.file_name} {activeResource.file_size ? `· ${activeResource.file_size}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={fileUrl}
            download={activeResource.file_name}
            className="w-8 h-8 rounded-lg bg-[#091b36] border border-blue-900/50 text-slate-200 hover:text-white flex items-center justify-center transition"
            title="Save Document"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-lg bg-[#091b36] border border-blue-900/50 text-slate-200 hover:text-white flex items-center justify-center transition"
            title="Share Document"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveResource(null);
            }}
            className="w-8 h-8 rounded-lg bg-[#091b36] border border-blue-900/50 text-slate-200 hover:text-white flex items-center justify-center transition"
            title="Close Viewer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Viewer Content Frame */}
      <div className="flex-1 w-full bg-[#040b17] overflow-hidden relative flex flex-col">
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title={activeResource.title}
          className="w-full h-full border-0 bg-white"
        />

        {/* Floating Save Overlay Bar at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2 bg-[#061226]/95 backdrop-blur border border-blue-900/60 rounded-xl p-2.5 shadow-xl">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">
              Offline Document Access
            </p>
            <p className="text-[10px] text-slate-300 truncate">
              Save copy to device for offline study
            </p>
          </div>

          <a
            href={fileUrl}
            download={activeResource.file_name}
            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Copy</span>
          </a>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-2.5 rounded-lg bg-[#091b36] border border-blue-800/50 text-slate-300 text-xs font-semibold flex items-center gap-1 transition shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
