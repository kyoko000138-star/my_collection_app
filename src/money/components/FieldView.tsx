import React from 'react';
import { UserState } from '../types';
import { MAP_INFO, MAP_CONNECTIONS } from '../gameData';

interface Props { user: UserState; onMove: any; shadows: any[]; }

export const FieldView: React.FC<Props> = ({ user, shadows }) => {
  const currentLoc = user.currentLocation;
  const info = MAP_INFO[currentLoc] || { name: '???', type: 'DANGER', color: '#000', minimap: {x:0,y:0} };
  const connections = MAP_CONNECTIONS[currentLoc] || {};
  const mapGrid = info.minimap; 

  const renderMinimapNode = (x: number, y: number) => {
    if (x === mapGrid.x && y === mapGrid.y) return <div style={{width:'100%', height:'100%', background:'#ef4444', borderRadius:'50%'}} />;
    const neighbor = Object.values(MAP_INFO).find(m => m.minimap.x === x && m.minimap.y === y);
    if (neighbor) return <div style={{width:'100%', height:'100%', background: neighbor.color, borderRadius:'1px', opacity:0.8}} />;
    return <div style={{width:'100%', height:'100%', background:'#222'}} />;
  };

  return (
    <div style={{ width:'100%', height:'100%', background: info.color, display:'flex', flexDirection:'column', position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'15px', background:'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <div>
            <h2 style={{ margin:0, fontSize:'18px', textShadow:'1px 1px 0 #000', color:'#fff' }}>📍 {info.name}</h2>
            <span style={{ fontSize:'12px', color:'#eee', textShadow:'1px 1px 0 #000' }}>{info.type === 'TOWN' ? '안전한 마을' : '⚠️ 위험 지역'}</span>
        </div>
        <div style={{ background:'#111', padding:'4px', border:'1px solid #555', borderRadius:4 }}>
            {Array.from({length:5}).map((_, y) => (
                <div key={y} style={{display:'flex'}}>{Array.from({length:5}).map((_, x) => (
                    <div key={`${x}-${y}`} style={{width:6, height:6, margin:1}}>{renderMinimapNode(x, y)}</div>
                ))}</div>
            ))}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
        <div style={{ fontSize:'60px', marginBottom:'20px' }}>{user.isExhausted ? '🚑' : '🧙‍♂️'}</div>
        {user.isExhausted && <div style={{background:'#ef4444', color:'#fff', padding:'4px 8px', borderRadius:4, fontWeight:'bold'}}>탈진!</div>}
        {shadows.length > 0 && <div style={{background:'rgba(0,0,0,0.7)', color:'#ef4444', padding:'4px 8px', borderRadius:4, marginTop:10}}>👻 그림자 {shadows.length}체</div>}
      </div>

      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {connections.N && <div style={{position:'absolute', top:60, width:'100%', textAlign:'center', color:'#fff', fontWeight:'bold', textShadow:'1px 1px 0 #000'}}>⬆️ {MAP_INFO[connections.N]?.name}</div>}
        {connections.S && <div style={{position:'absolute', bottom:20, width:'100%', textAlign:'center', color:'#fff', fontWeight:'bold', textShadow:'1px 1px 0 #000'}}>⬇️ {MAP_INFO[connections.S]?.name}</div>}
        {connections.W && <div style={{position:'absolute', left:10, top:'50%', color:'#fff', fontWeight:'bold', textShadow:'1px 1px 0 #000'}}>⬅️ {MAP_INFO[connections.W]?.name}</div>}
        {connections.E && <div style={{position:'absolute', right:10, top:'50%', color:'#fff', fontWeight:'bold', textShadow:'1px 1px 0 #000'}}>➡️ {MAP_INFO[connections.E]?.name}</div>}
      </div>
    </div>
  );
};
