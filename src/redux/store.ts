import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Reducers
// ADMIN -
import AdminDraftReducer from "./features/admin/draftSlice";
import OrganizationReducer from "./features/admin/organizationSlice";
import WithrawalMethodReducer from "./features/admin/withrawalmethodSlice";
import AdminWorkshopReducer from "./features/admin/workshopSlice";
import AdminStudentsReducer from "./features/admin/studentsSlice";
import TeamReducer from "./features/admin/teamSlice";
import TeamRequestReducer from "./features/admin/teamrequestSlice";
import AdminSpeakersReducer from "./features/admin/speakersSlice";
import WithdrawalMethodReducer from "./features/admin/withrawalmethodSlice";
import AdminRegistrationReducer from "./features/admin/registrationSlice";
// All Access
import StudentReducer from "./features/studentsSlice";
import WorkshopReducer from "./features/workshopSlice";
import DBUserReducer from "./features/dbuserSlice";
import MessagesReducer from "./features/messagesSlice";
import NotificationReducer from './features/notificationSlice'
import AdminDraftsReducer from "./features/admin/draftsSlice"; // Add this

export const store = configureStore({
  reducer: {
    OrganizationReducer,
    WithrawalMethodReducer,
    AdminDraftReducer,
    DBUserReducer,
    TeamReducer,
    TeamRequestReducer,
    WithdrawalMethodReducer,
    AdminSpeakersReducer,
    AdminWorkshopReducer,
    AdminStudentsReducer,
    StudentReducer,
    WorkshopReducer,
    AdminDraftsReducer,
    AdminRegistrationReducer,
    MessagesReducer,
    NotificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
