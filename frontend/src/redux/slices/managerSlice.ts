
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IManagerSlice } from "./interface/IManagerSlice";

const loadManagerFromStorage = (): IManagerSlice => {
  try {
    const stored = localStorage.getItem("manager");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        managerId: parsed.managerId ?? null,
        name: parsed.name ?? null,
        email: parsed.email ?? null,
        role: parsed.role ?? null,
        isActive: parsed.isActive ?? null,
      };
    }
  } catch {
    localStorage.removeItem("manager");
  }
  return {
    managerId: null,
    name: null,
    email: null,
    role: null,
    isActive: null,
  };
};

const initialState: IManagerSlice = loadManagerFromStorage();

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    setManager: (
      state,
      action: PayloadAction<{
        _id: string;
        name: string;
        email: string;
        role: string;
        isActive?: boolean;
      }>
    ) => {
      const { _id, name, email, role, isActive } = action.payload;

      state.managerId = _id;
      state.name = name;
      state.email = email;
      state.role = role;
      state.isActive = isActive !== undefined ? isActive : true;

      localStorage.setItem("manager", JSON.stringify(state));
    },

    clearManagerDetails: (state) => {
      state.managerId = null;
      state.name = null;
      state.email = null;
      state.role = null;
      state.isActive = null;
      localStorage.removeItem("manager");
    },
  },
});

export const { setManager, clearManagerDetails } = managerSlice.actions;
export default managerSlice.reducer;