// redux/slices/interface/IManagerSlice.ts
export interface IManagerSlice {
  managerId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  department: string | null;
  isActive: boolean | null;
}