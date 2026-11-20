import React, { useState } from 'react';
import { Whiteboard } from './Whiteboard';
import { BoardStore } from './boardStore';

// سبورة مستقلة على هذا الجهاز فقط (للمعلم والإدارة)، تُمسح عند الإغلاق
export const StandaloneBoard: React.FC<{ isAr: boolean; onClose: () => void }> = ({ isAr, onClose }) => {
  const [store] = useState(() => {
    const s = new BoardStore();
    s.apply({ t: 'open' });
    return s;
  });
  return (
    <Whiteboard
      store={store}
      canDraw
      isOwner
      standalone
      isAr={isAr}
      send={(op) => store.apply(op)}
      emit={() => {}}
      onMinimize={() => {}}
      onClose={onClose}
    />
  );
};
