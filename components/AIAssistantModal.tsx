import React from 'react';
import { X, Copy, MessageCircle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  loading: boolean;
  targetPhone: string;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, message, loading, targetPhone }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    alert('Mensagem copiada!');
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${targetPhone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-gradient-to-r from-purple-900/20 to-slate-900">
          <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            <span className="text-xl">✨</span> Assistente IPTV IA
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="text-slate-300 animate-pulse">Gerando mensagem inteligente...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {message}
              </div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg text-white font-medium transition-all">
                  <Copy size={18} /> Copiar
                </button>
                <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 p-3 rounded-lg text-white font-medium transition-all shadow-lg shadow-green-500/20">
                  <MessageCircle size={18} /> Enviar WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;