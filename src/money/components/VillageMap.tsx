// VillageMap.tsx 수정

// ... imports ...

export const VillageMap: React.FC<Props> = ({ onChangeScene }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚩 머니 빌리지</h2>
      <div style={styles.mapArea}>
        
        {/* 기존 건물들 */}
        <div style={{...styles.building, top: '20%', left: '20%'}} onClick={() => onChangeScene(Scene.LIBRARY)}>
          <div style={styles.icon}>🏛️</div>
          <div style={styles.label}>도서관 (기록)</div>
        </div>
        <div style={{...styles.building, top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} onClick={() => onChangeScene(Scene.GARDEN)}>
          <div style={{...styles.icon, fontSize: '50px'}}>🏡</div>
          <div style={styles.label}>내 정원</div>
        </div>
        
        {/* [NEW] 대장간 */}
        <div style={{...styles.building, top: '25%', right: '20%'}} onClick={() => onChangeScene(Scene.FORGE)}>
          <div style={styles.icon}>⚒️</div>
          <div style={styles.label}>대장간</div>
        </div>

        {/* [NEW] 상점 */}
        <div style={{...styles.building, top: '55%', right: '15%'}} onClick={() => onChangeScene(Scene.SHOP)}>
          <div style={styles.icon}>🏪</div>
          <div style={styles.label}>잡화점</div>
        </div>

        <div style={{...styles.building, bottom: '15%', left: '50%', transform: 'translateX(-50%)'}} onClick={() => onChangeScene(Scene.WORLD_MAP)}>
          <div style={styles.icon}>🏰</div>
          <div style={styles.label}>성 밖으로</div>
        </div>
      </div>
    </div>
  );
};
// styles는 기존 유지
