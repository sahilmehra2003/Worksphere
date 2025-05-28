/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useReducer } from 'react';
import { apiConnector } from '../services/apiConnector';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { setCredentials, logoutUser } from '../redux/Slices/authSlice';

// Action types for local reducer
const AUTH_LOADING = 'AUTH_LOADING';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_ERROR = 'AUTH_ERROR';

// Reducer function for local component state
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_LOADING:
      console.log("Protected.jsx: Reducer AUTH_LOADING");
      return { loading: true, user: null, error: null };
    case AUTH_SUCCESS:
      console.log("Protected.jsx: Reducer AUTH_SUCCESS, payload:", action.payload);
      return { loading: false, user: action.payload, error: null };
    case AUTH_ERROR:
      console.log("Protected.jsx: Reducer AUTH_ERROR, error:", action.payload);
      return { loading: false, user: null, error: action.payload };
    default:
      return state;
  }
}

function Protected({ children, role }) {
  // Local state for this component's auth check (using 'localDispatch' for clarity)
  const [state, localDispatch] = useReducer(authReducer, { loading: true, user: null, error: null });
  const navigate = useNavigate();
  const location = useLocation();
  const reduxDispatch = useReduxDispatch(); // For dispatching actions to Redux store

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    console.log("Protected.jsx: useEffect triggered. Path:", location.pathname, "Role:", role);

    const checkAuth = async () => {
      localDispatch({ type: AUTH_LOADING });

      try {
        console.log("Protected.jsx: checkAuth started. Attempting /me call.");
        const response = await apiConnector("GET", "/api/v1/auth/me", null, null, null, signal);
        const responseData = response.data;

        console.log("Protected.jsx: /me API call responded. Signal aborted:", signal.aborted);

        if (signal.aborted) {
          console.log("Protected.jsx: API call aborted after response but before processing.");
          return;
        }

        // **Recommended Change Here:**
        // If the API call was successful (e.g. HTTP 200) but the backend logic indicates
        // failure (e.g., success: false, or no user data), dispatch global logout.
        if (!responseData || !responseData.success || !responseData.user) {
          console.log("Protected.jsx: /me call indicates invalid session or user data missing in response. Payload:", responseData);
          localDispatch({ type: AUTH_ERROR, payload: responseData?.message || "Authentication failed: Invalid response from server." });
          if (!responseData || !responseData.success) { // If backend explicitly states failure
            console.log("Protected.jsx: Dispatching logoutUser due to server indicating unsuccessful auth.");
            reduxDispatch(logoutUser()); // Ensure global state and localStorage are cleared
          }
          navigate("/login");
          return;
        }

        const user = responseData.user;
        console.log("Protected.jsx: User data received from /me:", user);
        console.log("Protected.jsx: Required role:", role, "| User role:", user.role);
        console.log("Protected.jsx: User isProfileComplete:", user.isProfileComplete);

        // Role Check
        if (role && user.role !== role) {
          console.log("Protected.jsx: Role mismatch. Required:", role, "Got:", user.role, ". Navigating.");
          // Consider navigating to a specific '/unauthorized' page if it exists
          localDispatch({ type: AUTH_ERROR, payload: "Access denied: Insufficient role." });
          // Navigating to login on role mismatch might be too aggressive if the user is otherwise authenticated.
          // An '/unauthorized' page or redirecting to a default page might be better.
          // For now, keeping as per original logic of navigating to /login.
          navigate("/login"); // Or navigate("/unauthorized") or navigate("/app/dashboard")
          return;
        }

        // Profile Completion Check (but allow access to complete-profile page itself)
        if (location.pathname !== '/app/complete-profile' && !user.isProfileComplete) {
          console.log("Protected.jsx: Profile not complete. Navigating to /app/complete-profile.");
          localDispatch({ type: AUTH_SUCCESS, payload: user });
          reduxDispatch(setCredentials({ user: user }));
          navigate("/app/complete-profile", { replace: true });
          return;
        }

        console.log("Protected.jsx: Authentication successful. Dispatching AUTH_SUCCESS locally and setCredentials to Redux.");
        localDispatch({ type: AUTH_SUCCESS, payload: user });
        reduxDispatch(setCredentials({ user: user }));

      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          console.log("Protected.jsx: Auth check explicitly aborted by cleanup (caught AbortError/CanceledError).");
        } else if (!signal.aborted) {
          console.error("Protected.jsx: Authentication error in checkAuth catch block:", err);
          const errorMessage = err.response?.data?.message || err.message || "Authentication failed.";
          console.log("Protected.jsx: Dispatching logoutUser due to unrecoverable auth error in catch block.");
          reduxDispatch(logoutUser()); // Clears global Redux state and localStorage
          localDispatch({ type: AUTH_ERROR, payload: errorMessage });
          navigate("/login");
        } else {
          console.log("Protected.jsx: Error caught, but request was already aborted (signal.aborted is true). Error name:", err.name);
        }
      }
    };

    checkAuth();

    return () => {
      console.log("Protected.jsx: useEffect cleanup. Aborting ongoing auth check. Path:", location.pathname);
      abortController.abort();
    };
  }, [location.pathname, role, navigate, reduxDispatch]); // Dependencies

  console.log("Protected.jsx: Rendering component. Current local auth state:", state);

  if (state.loading) {
    console.log("Protected.jsx: Rendering loading state (<div>Loading...</div>)");
    return <div>Loading...</div>;
  }

  if (state.user) {
    console.log("Protected.jsx: Rendering protected children. User name (if available):", state.user.name);
    return children;
  }

  console.log("Protected.jsx: Not loading and no user. Error state:", state.error, ". Navigation should have occurred. Returning null.");
  return null;
}

export default Protected;