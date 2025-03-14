import { Registration } from "@/lib/componentprops";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const initialState = {
  value: [] as Registration[]
};

export const registrationsSlice = createSlice({
  name: "AdminRegistrations",
  initialState,
  reducers: {
    setAdminRegistrations: (state, action: PayloadAction<Registration[]>) => {
      state.value = action.payload;
    },
    addRegistration: (state, action: PayloadAction<Registration>) => {
      // Check if registration already exists
      const exists = state.value.some(reg => reg.docID === action.payload.docID);
      if (!exists) {
        state.value.push(action.payload);
      }
    },
    updateRegistration: (state, action: PayloadAction<Registration>) => {
      const index = state.value.findIndex(reg => reg.docID === action.payload.docID);
      if (index !== -1) {
        state.value[index] = action.payload;
      } else {
        state.value.push(action.payload);
      }
    },
    removeRegistration: (state, action: PayloadAction<string>) => {
      state.value = state.value.filter(reg => reg.docID !== action.payload);
    }
  }
});

export const { 
  setAdminRegistrations, 
  addRegistration, 
  updateRegistration, 
  removeRegistration 
} = registrationsSlice.actions;

export default registrationsSlice.reducer;