import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DBUSER } from "@/lib/types";



const initialState = {
    value: undefined as DBUSER[] | undefined | null,
}
export const TeamRequest = createSlice(
    {
        name: 'TeamRequest',
        initialState,
        reducers: {
            setTeamRequest: (state, action: PayloadAction<DBUSER[] | undefined | null>)=> {
                return {
                    value: action.payload
                }
            },
            getTeamRequest: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setTeamRequest, getTeamRequest} = TeamRequest.actions
export default TeamRequest.reducer 

