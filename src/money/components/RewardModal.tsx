// src/money/components/RewardModal.tsx
import React from 'react';
import { RewardItem } from '../rewardData';

type Props = {
  open: boolean;
  seedPackets: number;
  lastReward: RewardItem | null;
  onPull: () => void;
  onClose: () => void;
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.65)',
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: '#0b1220',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 16,
  padding: 16,
  color: '#fff',
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
};

const btn: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
};

export const RewardModal: React.FC<Props> = ({
  open,
  seedPackets,
  lastReward,
  onPull,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.12em' }}>
              SEED PACKET
            </div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>씨앗 봉투</div>
          </div>
          <button onClick={onClose} style={{ ...btn, width: 44, padding: 10 }}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13 }}>
          보유: <b>{seedPackets}</b> 개
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={onPull}
            disabled={seedPackets <= 0}
            style={{
              ...btn,
              opacity: seedPackets <= 0 ? 0.45 : 1,
              cursor: seedPackets <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            🌱 뽑기 (1개 소모)
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
            minHeight: 86,
          }}
        >
          {lastReward ? (
            <>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {lastReward.rarity} · {lastReward.type}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>
                {lastReward.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                {lastReward.desc}
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.75, fontSize: 13, lineHeight: 1.5 }}>
              봉투를 열면 정원에 놓을 작은 물건이나, 특별한 아이템이 나와요.
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12, lineHeight: 1.5 }}>
          * 씨앗 봉투는 “절약/저축 행동”에서 얻도록 설계하는 게 핵심이에요. :contentReference[oaicite:3]{index=3}
        </div>
      </div>
    </div>
  );
};
