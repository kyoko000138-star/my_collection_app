// src/game/components/DialogueBox.tsx
import React from 'react';
import type { DialogueLine } from '../dialogueTypes';
import { NPC_DEFINITIONS } from '../npcDefinitions';

interface DialogueBoxProps {
  line: DialogueLine | null;
  visible: boolean;
  onNext?: () => void;
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  padding: '8px 8px 10px',
  pointerEvents: 'none',
  zIndex: 30,
};

const boxStyle: React.CSSProperties = {
  maxWidth: '640px',
  margin: '0 auto 4px',
  borderRadius: 14,
  border: '2px solid #e2d3b5',
  background: 'rgba(15, 12, 8, 0.92)',
  color: '#fdf4de',
  padding: '10px 12px 12px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

const namePlateStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'rgba(46, 34, 19, 0.96)',
  border: '1px solid #e2d3b5',
  marginBottom: 6,
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const textStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
};

const nextIndicatorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#d2c0a0',
  textAlign: 'right',
  marginTop: 4,
};

function getSpeakerDisplay(line: DialogueLine | null) {
  if (!line) return { name: '', emoji: '' };

  if (line.speakerType === 'NPC' && line.speakerId) {
    const def = NPC_DEFINITIONS[line.speakerId];
    if (def) {
      return {
        name: def.nameKo,
        emoji: def.emoji ?? '',
      };
    }
  }

  if (line.speakerType === 'PLAYER') {
    return { name: line.speakerName ?? '나', emoji: '🙂' };
  }

  // SYSTEM
  return { name: line.speakerName ?? '시스템', emoji: '★' };
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  line,
  visible,
  onNext,
}) => {
  if (!visible || !line) return null;

  const { name, emoji } = getSpeakerDisplay(line);

  return (
    <div style={containerStyle}>
      <div style={boxStyle} onClick={onNext}>
        {name && (
          <div style={namePlateStyle}>
            {emoji && <span>{emoji}</span>}
            <span>{name}</span>
          </div>
        )}
        <div style={textStyle}>{line.text}</div>
        <div style={nextIndicatorStyle}>탭하여 다음 ▶</div>
      </div>
    </div>
  );
};
