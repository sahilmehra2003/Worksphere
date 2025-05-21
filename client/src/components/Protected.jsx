/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useReducer } from 'react'; 
import { apiConnector } from '../services/apiConnector';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch as useReduxDispatch } from 'react-redux'; 
import { setCredentials } from '../redux/Slices/authSlice'; 

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
  // Local state for this component's auth check
  const [state, dispatch] = useReducer(authReducer, { loading: true, user: null, error: null });
  const navigate = useNavigate();
  const location = useLocation();
  const reduxDispatch = useReduxDispatch(); // For dispatching actions to Redux store

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    console.log("Protected.jsx: useEffect triggered. Path:", location.pathname, "Role:", role);

    const checkAuth = async () => {
      // Set loading state for this component's auth check
      // This happens on mount and if dependencies were to change (though they are empty here for the main check)
      dispatch({ type: AUTH_LOADING });

      try {
        console.log("Protected.jsx: checkAuth started. Attempting /me call.");
        // Pass the signal to apiConnector.
        // The apiConnector should be modified to accept the signal in its options/headers if not already.
        // For example: await apiConnector("GET", "/api/v1/auth/me", null, { signal });
        // Assuming your apiConnector was updated as discussed:
        const response = await apiConnector("GET", "/api/v1/auth/me", null, null, null, signal);
        const responseData = response.data; // Assuming your apiConnector returns the full response object

        console.log("Protected.jsx: /me API call responded. Signal aborted:", signal.aborted);

        if (signal.aborted) {
          console.log("Protected.jsx: API call aborted after response but before processing.");
          return;
        }

        if (!responseData || !responseData.success || !responseData.user) {
          console.log("Protected.jsx: /me call failed or user data missing in response. Payload:", responseData);
          dispatch({ type: AUTH_ERROR, payload: "Authentication failed: Invalid response from server." });
          navigate("/login");
          return;
        }

        const user = responseData.user;
        console.log("Protected.jsx: User data received from /me:", user);
        console.log("Protected.jsx: Required role:", role, "| User role:", user.role);
        console.log("Protected.jsx: User isProfileComplete:", user.isProfileComplete);

        // Role Check
        if (role && user.role !== role) {
          console.log("Protected.jsx: Role mismatch. Required:", role, "Got:", user.role, ". Navigating to /unauthorized or /login.");
          // Consider navigating to a specific '/unauthorized' page if it exists
          // For now, dispatching error and navigating to login for simplicity.
          dispatch({ type: AUTH_ERROR, payload: "Access denied: Insufficient role." });
          navigate("/login"); // Or navigate("/unauthorized");
          return;
        }

        // Profile Completion Check (but allow access to complete-profile page itself)
        if (location.pathname !== '/app/complete-profile' && !user.isProfileComplete) {
          console.log("Protected.jsx: Profile not complete. Navigating to /app/complete-profile.");
          // We still need to authenticate the user for the complete-profile page
          // So, we dispatch AUTH_SUCCESS to stop loading, then navigate.
          // The complete-profile page will then be rendered.
          dispatch({ type: AUTH_SUCCESS, payload: user }); // Allow rendering children (which would be CompleteProfile)
          reduxDispatch(setCredentials({ user: user })); // Update Redux store too
          navigate("/app/complete-profile", { replace: true });
          return;
        }

        console.log("Protected.jsx: Authentication successful. Dispatching AUTH_SUCCESS locally and setCredentials to Redux.");
        dispatch({ type: AUTH_SUCCESS, payload: user });
        // Also update the global Redux store so other components (like Navbar, CompleteProfile) can access user info
        reduxDispatch(setCredentials({ user: user }));

      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          console.log("Protected.jsx: Auth check explicitly aborted by cleanup (caught AbortError/CanceledError).");
          // No state update needed if aborted, it means the component instance is gone or effect re-ran
        } else if (!signal.aborted) { // Only process error if the effect itself wasn't aborted during the error
          console.error("Protected.jsx: Authentication error in checkAuth catch block:", err);
          const errorMessage = err.response?.data?.message || err.message || "Authentication failed.";
          dispatch({ type: AUTH_ERROR, payload: errorMessage });
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
  }, [location.pathname, role, navigate, reduxDispatch]); // Restore dependencies:
  // location.pathname: to re-check if path changes
  // role: to re-check if role prop changes
  // navigate: stable, but good practice if used in effect
  // reduxDispatch: stable

  console.log("Protected.jsx: Rendering component. Current auth state:", state);

  if (state.loading) {
    console.log("Protected.jsx: Rendering loading state (<div>Loading...</div>)");
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  if (state.user) {
    console.log("Protected.jsx: Rendering protected children. User:", state.user.name);
    // Pass the user object to children if they need it directly,
    // though they can also get it from Redux store now.
    // return React.cloneElement(children, { authUser: state.user });
    return children;
  }

  // If not loading and no user (e.g., auth error led to user being null),
  // navigation should have occurred. Returning null is a fallback.
  console.log("Protected.jsx: Not loading and no user. Error state:", state.error, "Returning null (navigation should have happened).");
  return null;
}

export default Protected;