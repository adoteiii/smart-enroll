import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DBUSER } from "@/lib/types";


const initialState = {
    value: undefined as DBUSER|undefined|null,
}
export const DBUser = createSlice(
    {
        name: 'DBUser',
        initialState,
        reducers: {
            setDBUser: (state, action: PayloadAction<DBUSER|null|undefined>)=> {
                return {
                    value: action.payload
                }
            },
            getDBUser: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setDBUser, getDBUser} = DBUser.actions
export default DBUser.reducer 

