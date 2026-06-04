import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginSession } = useAuth();
  const [error, setError] = useState("");
  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userRaw = params.get("user");
    if (!accessToken || !refreshToken || !userRaw) {
      setError("\u0110\u0103ng nh\u1EADp OAuth th\u1EA5t b\u1EA1i ho\u1EB7c thi\u1EBFu th\xF4ng tin phi\xEAn.");
      return;
    }
    try {
      const user = JSON.parse(userRaw);
      loginSession(accessToken, refreshToken, user);
      navigate("/", { replace: true });
    } catch {
      setError("Kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c th\xF4ng tin ng\u01B0\u1EDDi d\xF9ng t\u1EEB OAuth.");
    }
  }, [params, loginSession, navigate]);
  if (error) {
    return /* @__PURE__ */ React.createElement("div", { className: "container py-5 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-danger" }, error), /* @__PURE__ */ React.createElement(Link, { to: "/login", className: "btn btn-primary rounded-pill" }, "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp"));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container py-5 text-center" }, /* @__PURE__ */ React.createElement("p", null, "\u0110ang ho\xE0n t\u1EA5t \u0111\u0103ng nh\u1EADp..."));
}
export {
  OAuthCallbackPage
};
