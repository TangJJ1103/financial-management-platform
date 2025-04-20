import { Navigate } from "react-router-dom";
import isLogin from "../globalFunction/isLogin";

const ProtectedRoute = ({ children }) => {
  if (!isLogin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
