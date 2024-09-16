import { create } from 'zustand';

type Props = {
  workspaceId: any;
  role: any;
  orgId: any;
  getData: (orgId: any, role?: any, workspaceId?: any) => void;
};

export const useDetailsToAdd = create<Props>((set) => ({
  workspaceId: '',
  role: '',
  orgId: '',
  getData: (orgId: any, role?: any, workspaceId?: any) => set({ role, workspaceId, orgId }),
}));
