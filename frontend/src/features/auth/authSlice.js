import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, refreshUser } from "./authThunks";
import { getToken, removeToken, setToken } from "../../utils/auth";

const initialState = {
  user: (() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || null;
      console.log("🔄 Loading user from localStorage:", userData);
      return userData;
    } catch {
      console.log("❌ Failed to load user from localStorage");
      return null;
    }
  })(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeToken();
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
    //  ADD: Update user role after kitchen operations
    updateUserRole(state, action) {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    updateUserKitchen(state, action) {
      if (state.user) {
        state.user.kitchenId = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log("✅ Registration response:", action.payload);
        
        // Handle response with both user and token
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          setToken(action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          console.log("✅ User registered with ID:", action.payload.user.id);
          console.log("✅ User data:", action.payload.user);
        } else {
          console.error("❌ No user/token data in registration response:", action.payload);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        setToken(action.payload.token);

        // Handle user data from login response
        if (action.payload.user) {
          state.user = action.payload.user;
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          console.log("✅ User logged in with ID:", action.payload.user.id);
          console.log("✅ User data:", action.payload.user);
        } else {
          console.error("❌ No user data in login response:", action.payload);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearError, updateUserRole, updateUserKitchen } = authSlice.actions;
export default authSlice.reducer;
