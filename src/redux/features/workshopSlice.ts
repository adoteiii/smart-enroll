import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkshopComponentProps } from "@/lib/componentprops";


const initialState = {
    value: undefined as WorkshopComponentProps[]|undefined|null,
}
export const Workshop = createSlice(
    {
        name: 'Workshop',
        initialState,
        reducers: {
            setWorkshop: (state, action: PayloadAction<WorkshopComponentProps[]|undefined|null>)=> {
                return {
                    value: action.payload
                }
            },
            getWorkshop: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setWorkshop, getWorkshop} = Workshop.actions
export default Workshop.reducer 

