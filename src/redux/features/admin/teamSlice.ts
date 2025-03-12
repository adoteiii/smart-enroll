import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DBUSER } from "@/lib/types";



const initialState = {
    value: undefined as DBUSER[] | undefined | null,
}
export const Team = createSlice(
    {
        name: 'Team',
        initialState,
        reducers: {
            setTeam: (state, action: PayloadAction<DBUSER[] | undefined | null>)=> {
                return {
                    value: action.payload
                }
            },
            getTeam: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setTeam, getTeam} = Team.actions
export default Team.reducer 

