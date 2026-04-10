import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    alert("Login to Book Flight")
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
