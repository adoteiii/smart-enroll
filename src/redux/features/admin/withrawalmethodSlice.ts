import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WithdrawalReceipient } from "@/lib/payment/types";



const initialState = {
    value: undefined as WithdrawalReceipient | undefined | null,
}
export const UserWithdrawalMethod = createSlice(
    {
        name: 'WithdrawalMethod',
        initialState,
        reducers: {
            setWithdrawalMethod: (state, action: PayloadAction<WithdrawalReceipient | undefined| null>)=> {
                return {
                    value: action.payload
                }
            },
            getWithdrawalMethod: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setWithdrawalMethod, getWithdrawalMethod} = UserWithdrawalMethod.actions
export default UserWithdrawalMethod.reducer 

