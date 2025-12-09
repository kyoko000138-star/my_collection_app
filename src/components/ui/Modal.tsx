// src/components/ui/Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', width: '100%', maxWidth: '400px', maxHeight: '80vh',
        borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', animation: 'popIn 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* 내용 (스크롤 가능) */}
        <div style={{ padding: '16px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
};

export default Modal;
