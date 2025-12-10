// src/money/components/InventoryModal.tsx
import React from 'react';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  junk: number;
  salt: number;
  dust: number;
  pureEssence: number;
  equipment: string[];
  canPurify: boolean;
  canCraft: boolean;
  onPurify: () => void;
  onCraft: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  open,
  onClose,
  junk,
  salt,
  dust,
  pureEssence,
  equipment,
  canPurify,
  canCraft,
  onPurify,
  onCraft,
}) => {
  if (!open) return null;

  return (
    <div /* 여기 모달 오버레이 스타일 */>
      <div /* 카드 스타일 */>
        {/* 👉 기존 "정화 루프", "장비 & 인벤토리" 섹션 JSX 그대로 붙이면 됨 */}
        {/* 단, gameState.xxx 대신 위에서 받은 props 사용 */}
        {/* 예: gameState.inventory.junk -> junk */}
        {/*     handlePurify()       -> onPurify() */}
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default InventoryModal;
