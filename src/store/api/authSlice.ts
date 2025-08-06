import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  token: string | null;
  email: string | null;
  refreshToken: string | null,
}

const initialState: AuthState = {
  token: sessionStorage.getItem("token"),
  email: sessionStorage.getItem("email"),
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ New version: stores both
    setCredentials(state, action: PayloadAction<{ token: string; email: string; refreshToken?: string}>) {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.refreshToken = action.payload.refreshToken ?? null;
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("email", action.payload.email);
    },

    // ✅ Keep if you want backward compatibility temporarily
    setToken(state,action: PayloadAction<{ token: string; refreshToken: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      sessionStorage.setItem("token", action.payload.token);
    },
    
    logout(state) {
      state.token = null;
      state.email = null;
      state.refreshToken = null;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("email");
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
