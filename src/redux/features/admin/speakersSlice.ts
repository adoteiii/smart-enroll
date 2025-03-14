import { Speaker } from "@/lib/componentprops";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  value: [] as Speaker[],
};

export const speakersSlice = createSlice({
  name: "AdminSpeakers",
  initialState,
  reducers: {
    setAdminSpeakers: (state, action: PayloadAction<Speaker[]>) => {
      state.value = action.payload;
    },
    addSpeaker: (state, action: PayloadAction<Speaker>) => {
      const exists = state.value.some(
        (speaker) => speaker.docID === action.payload.docID
      );
      if (!exists) {
        state.value.push(action.payload);
      }
    },
    updateSpeaker: (state, action: PayloadAction<Speaker>) => {
      const index = state.value.findIndex(
        (speaker) => speaker.docID === action.payload.docID
      );
      if (index !== -1) {
        state.value[index] = action.payload;
      } else {
        state.value.push(action.payload);
      }
    },
    removeSpeaker: (state, action: PayloadAction<string>) => {
      state.value = state.value.filter(
        (speaker) => speaker.docID !== action.payload
      );
    },
  },
});

export const { setAdminSpeakers, addSpeaker, updateSpeaker, removeSpeaker } =
  speakersSlice.actions;

export default speakersSlice.reducer;
