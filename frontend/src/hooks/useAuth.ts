import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const useAuth = () => {
  const router = useRouter();

  const getToken = useCallback(() => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }, []);

  const decodeToken = useCallback((token?: string | null) => {
    try {
      if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
      return token ? (jwtDecode as any)(token) : null;
    } catch {
      return null;
    }
  }, []);

  const setToken = useCallback((token: string, userId?: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("user_id", userId);
  }, []);

  const removeToken = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }, []);

  const authGet = useCallback(async (url: string) => {
    const token = getToken();
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  }, [getToken]);

  const authPost = useCallback(async (url: string, data: any) => {
    const token = getToken();
    return axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } });
  }, [getToken]);

  const authPut = useCallback(async (url: string, data: any) => {
    const token = getToken();
    return axios.put(url, data, { headers: { Authorization: `Bearer ${token}` } });
  }, [getToken]);

  const authDelete = useCallback(async (url: string, option: any = {}) => {
    const token = getToken();
    return axios.delete(url, { headers: { Authorization: `Bearer ${token}` }, ...option });
  }, [getToken]);

  const handleAuthError = useCallback((error: any, setMessage?: (msg: string) => void) => {
    const errorMsg = error?.response?.data?.error || "サーバーエラーが発生しました。";
    const errorSource = error?.response?.data?.source;
    if (errorSource === "authenticateToken") {
      removeToken();
      if (setMessage) setMessage(errorMsg);
      setTimeout(() => router.push("/login"), 1000);
    } else if (setMessage) {
      setMessage(errorMsg);
    }
  }, [router, removeToken]);

  useEffect(() => {
    const publicRoutes = ["/login", "/register"] as const;
    const checkAuth = () => {
      const token = getToken();
      if (!token) {
        if (!publicRoutes.includes(router.pathname as any)) {
          router.push("/login");
        }
        return;
      }
      const decoded: any = decodeToken(token);
      if (!decoded) {
        removeToken();
        if (!publicRoutes.includes(router.pathname as any)) {
          router.push("/login");
        }
        return;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - currentTime;
      if (timeUntilExpiration <= 0) {
        removeToken();
        if (!publicRoutes.includes(router.pathname as any)) {
          router.push("/login");
        }
      } else {
        setTimeout(checkAuth, timeUntilExpiration * 1000);
      }
    };
    if (!(["/login", "/register"] as const).includes(router.pathname as any)) {
      checkAuth();
    }
  }, [router, getToken, removeToken, decodeToken]);

  return { handleAuthError, setToken, removeToken, authGet, authPost, authPut, authDelete };
};

export default useAuth;