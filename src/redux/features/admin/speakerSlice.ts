import { SpeakerComponeentProps } from "@/lib/componentprops";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const initialState = {
    value: undefined as SpeakerComponeentProps[] | undefined | null,
}
export const Speaker = createSlice(
    {
        name: 'Speaker',
        initialState,
        reducers: {
            setSpeaker: (state, action: PayloadAction<SpeakerComponeentProps[] | undefined | null>)=> {
                return {
                    value: action.payload
                }
            },
            getSpeaker: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setSpeaker, getSpeaker} = Speaker.actions
export default Speaker.reducer 

