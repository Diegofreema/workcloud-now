import { create } from 'zustand';

export type User = {
  name: string;
  role: string;
  id: string;
  image: string;
};
type StaffStore = {
  user: User | null;
  onSelect: (user: User) => void;
  onDeselect: () => void;
};

export const useSelect = create<StaffStore>((set) => ({
  user: null,
  onSelect: (user) => set({ user }),
  onDeselect: () => set({ user: null }),
}));
