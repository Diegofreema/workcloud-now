import { create } from 'zustand';

import { Id } from '~/convex/_generated/dataModel';

type State = {
  waitlistId: Id<'waitlists'> | null;
  setId: (id: Id<'waitlists'>) => void;
  removeId: () => void;
};

export const useWaitlistId = create<State>((set) => ({
  waitlistId: null,
  removeId: () => set({ waitlistId: null }),
  setId: (id) => set({ waitlistId: id }),
}));
