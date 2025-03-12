import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrganizationFormData } from "@/lib/componentprops";



const initialState = {
    value: undefined as OrganizationFormData | undefined | null,
}
export const Organization = createSlice(
    {
        name: 'organization',
        initialState,
        reducers: {
            setOrganization: (state, action: PayloadAction<OrganizationFormData | undefined | null>)=> {
                return {
                    value: action.payload
                }
            },
            getOrganization: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setOrganization, getOrganization} = Organization.actions
export default Organization.reducer 

