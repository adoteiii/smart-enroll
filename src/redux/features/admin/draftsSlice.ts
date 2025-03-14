import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkshopComponentProps } from "@/lib/componentprops";

// Initial state for drafts array
const initialState = {
  value: [] as WorkshopComponentProps[]
};

// Create drafts slice (for managing multiple drafts)
export const draftsSlice = createSlice({
  name: "AdminDrafts",
  initialState,
  reducers: {
    setAdminDrafts: (state, action: PayloadAction<WorkshopComponentProps[]>) => {
      state.value = action.payload;
    },
    addDraft: (state, action: PayloadAction<WorkshopComponentProps>) => {
      // Check for duplicates before adding
      const exists = state.value.some(draft => draft.docID === action.payload.docID);
      if (!exists) {
        state.value.push(action.payload);
      }
    },
    updateDraft: (state, action: PayloadAction<WorkshopComponentProps>) => {
      const index = state.value.findIndex(draft => draft.docID === action.payload.docID);
      if (index !== -1) {
        state.value[index] = action.payload;
      } else {
        // If not found, add it
        state.value.push(action.payload);
      }
    },
    deleteDraft: (state, action: PayloadAction<string>) => {
      state.value = state.value.filter(draft => draft.docID !== action.payload);
    }
  }
});

// Export actions
export const { setAdminDrafts, addDraft, updateDraft, deleteDraft } = draftsSlice.actions;

// Export reducer
export default draftsSlice.reducer;