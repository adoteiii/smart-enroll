import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StudentComponentProps } from "@/lib/componentprops";



const initialState = {
    value: undefined as StudentComponentProps[]|undefined,
}
export const AdminStudent = createSlice(
    {
        name: 'AdminStudent',
        initialState,
        reducers: {
            setAdminStudent: (state, action: PayloadAction<StudentComponentProps[]|undefined>)=> {
                return {
                    value: action.payload
                }
            },
            getAdminStudent: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setAdminStudent, getAdminStudent} = AdminStudent.actions
export default AdminStudent.reducer 

