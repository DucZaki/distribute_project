import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
const STORAGE_KEY = "zakibooking-theme";
function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
const ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      themeIcon: theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}",
      themeTitle: theme === "dark" ? "Chuy\u1EC3n sang ch\u1EBF \u0111\u1ED9 s\xE1ng" : "Chuy\u1EC3n sang ch\u1EBF \u0111\u1ED9 t\u1ED1i"
    }),
    [theme, toggleTheme]
  );
  return /* @__PURE__ */ React.createElement(ThemeContext.Provider, { value }, children);
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
export {
  ThemeProvider,
  useTheme
};
