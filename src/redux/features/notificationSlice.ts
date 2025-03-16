import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseNotification } from "@/lib/componentprops";


const initialState = {
    value: undefined as FirebaseNotification[]|undefined|null,
}
export const Notifications = createSlice(
    {
        name: 'Notifications',
        initialState,
        reducers: {
            setNotifications: (state, action: PayloadAction<FirebaseNotification[]|undefined|null>)=> {
                return {
                    value: action.payload
                }
            },
            getNotifications: (state)=>{
                return {
                    value: state.value
                }
            }
        } 
    }
)

export const {setNotifications, getNotifications} = Notifications.actions
export default Notifications.reducer 

