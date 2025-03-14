import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Student } from "@/lib/componentprops";

const initialState = {
  value: [] as Student[],
};

export const studentsSlice = createSlice({
  name: "AdminStudents",
  initialState,
  reducers: {
    setAdminStudents: (state, action: PayloadAction<Student[]>) => {
      state.value = action.payload;
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      // Check if student already exists
      const exists = state.value.some(
        (student) => student.docID === action.payload.docID
      );
      if (!exists) {
        state.value.push(action.payload);
      }
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.value.findIndex(
        (student) => student.docID === action.payload.docID
      );
      if (index !== -1) {
        state.value[index] = action.payload;
      } else {
        state.value.push(action.payload);
      }
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.value = state.value.filter(
        (student) => student.docID !== action.payload
      );
    },
  },
});

export const { setAdminStudents, addStudent, updateStudent, removeStudent } =
  studentsSlice.actions;

export default studentsSlice.reducer;
