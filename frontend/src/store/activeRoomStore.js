import { create } from 'zustand';

const useActiveRoomStore = create((set, get) => ({
  activeRoomId: null,
  setActiveRoom: (id) => set({ activeRoomId: id }),
  leaveRoom: () => set({ activeRoomId: null }),
}));

export default useActiveRoomStore;
