import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/lib/types";


const initialState = {
    value: undefined as Message[]|undefined,
}
export const Messages = createSlice(
    {
        name: 'Messages',
        initialState,
        reducers: {
            setMessages: (state, action: PayloadAction<Message[]|undefined>)=> {
                return {
                    value: action.payload
                }
            },
            getMessages: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setMessages, getMessages} = Messages.actions
export default Messages.reducer 

