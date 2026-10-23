import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearAuthToken,
  extractUser,
  extractToken,
  saveLocalAvatar,
  getLocalAvatar,
  getAuthToken,
  setAuthToken,
} from "../utils/api";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getAuthToken);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        // Solo cargar usuario si hay un token JWT válido
        if (!token) {
          setUser(null);
          return;
        }
        const currentUser = await apiRequest("/auth/me");
        setUser({
          ...currentUser,
          avatar: currentUser?.avatar || getLocalAvatar(currentUser?.email),
        });
      } catch {
        clearAuthToken();
        setToken("");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [token]);

  const login = useCallback(async ({ email, password }) => {
    const payload = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const nextToken = extractToken(payload);

    if (!nextToken) {
      throw new Error("Login response did not include a token.");
    }

    setAuthToken(nextToken);
    const nextUser = extractUser(payload);
    setUser({
      ...nextUser,
      avatar: nextUser?.avatar || getLocalAvatar(nextUser?.email),
    });
    setToken(nextToken);
    return payload;
  }, []);

  const register = useCallback(async ({ avatar, name, email, password, resume, resumeFile, role }) => {
    const payload = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        avatar,
        name,
        email,
        password,
        role,
      }),
    });
    const nextToken = extractToken(payload);

    if (nextToken) {
      setAuthToken(nextToken);
      saveLocalAvatar(email, avatar);

      if (role === "candidate") {
        let uploadedResume = resume;

        if (resumeFile) {
          const formData = new FormData();
          formData.append("resume", resumeFile);
          const uploaded = await apiRequest("/uploads/resume/file", {
            method: "POST",
            body: formData,
          });
          uploadedResume = uploaded?.resumeUrl ?? uploaded?.resume ?? resume;
        }

        await apiRequest("/candidates", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            resume: uploadedResume,
          }),
        });
      }

      const nextUser = extractUser(payload);
      setUser({
        ...nextUser,
        avatar: avatar || nextUser?.avatar || getLocalAvatar(nextUser?.email),
      });
      setToken(nextToken);
    }

    return payload;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => null);
    clearAuthToken();
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isCandidate: user?.role === "candidate",
      isRecruiter: user?.role === "recruiter" || user?.role === "admin",
      isAuthenticated: Boolean(token),
      loadingUser,
      login,
      logout,
      register,
      token,
      user,
    }),
    [loadingUser, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
