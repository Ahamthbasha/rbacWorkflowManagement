
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice';
import managerReducer from './slices/managerSlice'

const rootReducers = combineReducers({
  user: userReducer,
  manager:managerReducer
});

const store = configureStore({
  reducer: rootReducers,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;