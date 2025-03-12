import { WorkshopComponentProps,  } from './../../../lib/componentprops';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";




const initialState = {
    value: undefined as WorkshopComponentProps|undefined|null
}
export const AdminDraft = createSlice(
    {
        name: 'AdminDraft',
        initialState,
        reducers: {
            setAdminDraft: (state, action: PayloadAction<WorkshopComponentProps|undefined|null>)=> {
                return {
                    value: action.payload
                }
            },
            getAdminDraft: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setAdminDraft, getAdminDraft} = AdminDraft.actions
export default AdminDraft.reducer 

