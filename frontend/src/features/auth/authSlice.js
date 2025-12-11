import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, refreshUser, updateProfile, validateUser, verifyRegistrationOtp, resetPasswordWithOtp, sendPasswordResetOtp } from "./authThunks";
import { getToken, removeToken, setToken, isTokenExpired } from "../../utils/auth";
// import { loginUser, registerUser, refreshUser, updateProfile } from "./authThunks";
// import { getToken, removeToken, setToken } from "../../utils/auth";

const initialState = {
  user: (() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || null;
      return userData;
    } catch {
      return null;
    }
  })(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
  registrationEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth(state) {
      const token = getToken();
      const userData = (() => {
        try {
          return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
          return null;
        }
      })();
      
      if (token && userData && !isTokenExpired(token)) {
        state.token = token;
        state.user = userData;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        removeToken();
        localStorage.removeItem("user");
      }
    },
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
    clearRegistrationState(state) {
      state.registrationEmail = null;
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
        // Registration successful, but no auto-login - wait for OTP verification
        state.registrationEmail = action.payload.user?.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // OTP VERIFICATION
      .addCase(verifyRegistrationOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationEmail = null;
        setToken(action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(verifyRegistrationOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // PASSWORD RESET WITH OTP
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        setToken(action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // SEND PASSWORD RESET OTP
      .addCase(sendPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordResetOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendPasswordResetOtp.rejected, (state, action) => {
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
      })
      
      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // VALIDATE USER
      .addCase(validateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(validateUser.rejected, (state) => {
        // Don't logout on validation failure - keep user logged in with stored data
      });
  },
});

export const { initializeAuth, logout, clearError, clearRegistrationState, updateUserRole, updateUserKitchen } = authSlice.actions;
export default authSlice.reducer;
