import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    value: undefined as any[] | undefined,
}
export const WithdrawalHistory = createSlice(
    {
        name: 'WithdrawalHistory',
        initialState,
        reducers: {
            setWithdrawalHistory: (state, action: PayloadAction<any[] | undefined>)=> {
                return {
                    value: action.payload
                }
            },
            getWithdrawalHistory: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setWithdrawalHistory, getWithdrawalHistory} = WithdrawalHistory.actions
export default WithdrawalHistory.reducer 

