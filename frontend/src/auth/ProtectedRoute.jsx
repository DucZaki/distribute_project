import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return /* @__PURE__ */ React.createElement(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
  }
  return children;
}
export {
  ProtectedRoute
};
