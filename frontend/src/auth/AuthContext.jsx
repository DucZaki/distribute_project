import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
const AuthContext = createContext(null);
function loadUser() {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const loginSession = useCallback(
    (accessToken, refreshToken, u) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("authUser", JSON.stringify(u));
      setUser(u);
    },
    []
  );
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    setUser(null);
  }, []);
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!localStorage.getItem("accessToken"),
      isAdmin: user?.vaiTro === "ADMIN" || user?.vaiTro === "ROLE_ADMIN",
      loginSession,
      logout
    }),
    [user, loginSession, logout]
  );
  return /* @__PURE__ */ React.createElement(AuthContext.Provider, { value }, children);
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
export {
  AuthProvider,
  useAuth
};
