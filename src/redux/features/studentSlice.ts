import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StudentComponentProps } from "@/lib/componentprops";

interface StudentState {
  value: StudentComponentProps[] | undefined;
}

const initialState: StudentState = {
  value: undefined,
};

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<StudentComponentProps[] | undefined>) => {
      state.value = action.payload;
    },
  },
});

export const { setStudent } = studentSlice.actions;
export default studentSlice.reducer;

// Selector
export const selectStudent = (state: { studentReducer: StudentState }) => state.studentReducer.value;