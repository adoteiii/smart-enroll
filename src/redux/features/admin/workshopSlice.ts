import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkshopComponentProps } from "@/lib/componentprops";


const initialState = {
    value: undefined as WorkshopComponentProps[]|undefined,
}
export const AdminWorkshop = createSlice(
    {
        name: 'AdminWorkshop',
        initialState,
        reducers: {
            setAdminWorkshop: (state, action: PayloadAction<WorkshopComponentProps[]|undefined>)=> {
                return {
                    value: action.payload
                }
            },
            getAdminWorkshop: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setAdminWorkshop, getAdminWorkshop} = AdminWorkshop.actions
export default AdminWorkshop.reducer 

