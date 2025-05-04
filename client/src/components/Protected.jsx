import  { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import toast from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("authToken");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

const hasRole = (role) => {
  const token = localStorage.getItem("authToken");
  console.log(token);
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    return decoded.role === role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

// eslint-disable-next-line react/prop-types
const Protected = ({ role }) => {
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Invalid Login credentials");
      setRedirectPath("/login");
    } else if (!hasRole(role)) {
      toast.error("Only Admin can enter the route");
      setRedirectPath("/signup");
    }
  }, [role]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default Protected;
