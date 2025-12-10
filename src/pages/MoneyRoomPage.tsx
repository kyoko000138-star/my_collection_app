import InventoryModal from '../money/components/InventoryModal';

// ...

<InventoryModal
  open={isInventoryModalOpen}
  onClose={() => setIsInventoryModalOpen(false)}
  junk={junk}
  salt={salt}
  dust={dust}
  pureEssence={pureEssence}
  equipment={equipment}
  canPurify={canPurify}
  canCraft={canCraftSword}
  onPurify={handlePurify}
  onCraft={handleCraftSword}
/>

export const MoneyRoomPage: React.FC = () => { ... }
