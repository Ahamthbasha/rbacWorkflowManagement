// redux/slices/managerSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IManagerSlice } from "./interface/IManagerSlice";

const initialState: IManagerSlice = {
  managerId: null,
  name: null,
  email: null,
  role: null,
  department: null,
  isActive: null,
};

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
        department?: string;
        isActive?: boolean;
      }>
    ) => {
      const { _id, name, email, role, department, isActive } = action.payload;

      state.managerId = _id;
      state.name = name;
      state.email = email;
      state.role = role;
      state.department = department || null;
      state.isActive = isActive !== undefined ? isActive : true;

      localStorage.setItem("manager", JSON.stringify(state));
    },

    clearManagerDetails: (state) => {
      state.managerId = null;
      state.name = null;
      state.email = null;
      state.role = null;
      state.department = null;
      state.isActive = null;
      localStorage.removeItem("manager");
    },

    updateManagerDepartment: (state, action: PayloadAction<string>) => {
      state.department = action.payload;
      localStorage.setItem("manager", JSON.stringify(state));
    },
  },
});

export const { setManager, clearManagerDetails, updateManagerDepartment } = managerSlice.actions;
export default managerSlice.reducer;