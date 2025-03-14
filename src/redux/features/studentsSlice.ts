import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Student } from "@/lib/componentprops";

interface StudentState {
  value: Student[] | undefined;
}

const initialState: StudentState = {
  value: undefined,
};

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<Student[] | undefined>) => {
      state.value = action.payload;
    },
  },
});

export const { setStudent } = studentSlice.actions;
export default studentSlice.reducer;

// Selector
export const selectStudent = (state: { studentReducer: StudentState }) => state.studentReducer.value;