import { create } from 'zustand';
import { createRef } from 'react';

const hoveredTileStore = create((set) => ({
    hoveredTileListRef: createRef(),
}));

export { hoveredTileStore }
