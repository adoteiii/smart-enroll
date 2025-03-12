import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Reducers
// ADMIN -
import AdminDraftReducer from "./features/admin/draftSlice";
import OrganizationReducer from "./features/admin/organizationSlice";
import WithrawalMethodReducer from "./features/admin/withrawalmethodSlice";
import AdminWorkshopReducer from "./features/admin/workshopSlice";
import AdminStudentReducer from "./features/admin/studentSlice";
import TeamReducer from "./features/admin/teamSlice";
import TeamRequestReducer from "./features/admin/teamrequestSlice";
import SpeakerReducer from "./features/admin/speakerSlice";
import WithdrawalMethodReducer from './features/admin/withrawalmethodSlice'

// All Access
import StudentReducer from "./features/studentSlice";
import WorkshopReducer from "./features/worksopSlice";
import DBUserReducer from "./features/dbuserSlice";


export const store = configureStore({
  reducer: {
    OrganizationReducer,
    WithrawalMethodReducer,
    AdminDraftReducer,
    DBUserReducer,
    TeamReducer,
    TeamRequestReducer,
    WithdrawalMethodReducer,
    SpeakerReducer,
    AdminWorkshopReducer,
    AdminStudentReducer,
    StudentReducer,
    WorkshopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
