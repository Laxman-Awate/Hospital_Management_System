import React, { useEffect } from 'react';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} transform transition-all flex flex-col max-h-[90vh]`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
