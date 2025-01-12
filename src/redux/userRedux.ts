import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'sonner';

const initialState = {
    userId: null,
    firstName: null,
    lastName: null,
    userType: null,
    accessToken: null,
    refreshToken: null,
    isFetching: false,
    error: false
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isFetching = true;
        },
        loginSuccess: (state, action) => {
            const userData = action.payload;
            
            state.firstName = userData.firstname ?? userData.user?.firstname ?? null;
            state.lastName = userData.lastname ?? userData.user?.lastname ?? null;
            state.userType = userData.usertype ?? userData.user?.usertype ?? null;
            state.userId = userData.id ?? userData.user?.id ?? null;
            state.isFetching = false;
            state.accessToken = userData.token?.accessToken ?? userData.accessToken ?? null;
            state.error = false;
            toast.success('Successfully logged in', { position:'bottom-right', duration: 2000 });
        },
        loginFail: (state, action) => {
            state.userType = null;
            state.userId = null;
            state.isFetching = false;
            state.accessToken = null;
            state.refreshToken = null;
            state.error = action.payload.error;
            toast.error(action.payload.error, { position:"bottom-right", duration: 2000 });
        },
        logOut: (state) => {
            Object.assign(state, initialState);
            toast.info('Logged out successfully', { position: "bottom-right", duration: 2000 });
        },
        resetLoginState: (state) => {
            state.isFetching = false;
            state.error = false;
        },
    },
});

export const { loginStart, loginSuccess, loginFail, logOut, resetLoginState } = userSlice.actions;
export default userSlice.reducer;