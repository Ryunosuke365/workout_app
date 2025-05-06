import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// 認証関連の共通処理をまとめたカスタムフック
const useAuth = () => {
  const router = useRouter();

  //ローカルストレージからトークンを取得
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  //ローカルストレージにトークンとユーザーIDを保存
  const setToken = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    if (userId) {
      localStorage.setItem("user_id", userId);
    }
  }, []);

  //ローカルストレージからトークンとユーザーIDを削除（ログアウト処理）
  const removeToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }, []);

  //トークンをデコードして中身を取得
  const decodeToken = useCallback((token) => {
    try {
      if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, []);

  //APIリクエスト用のヘッダー情報（認証付き）
  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [getToken]);

  //認証付きGETリクエスト
  const authGet = useCallback(
    async (url) => {
      const token = getToken();
      return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  //認証付きPOSTリクエスト
  const authPost = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  //認証付きPUTリクエスト
  const authPut = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  //認証付きDELETEリクエスト
  const authDelete = useCallback(
    async (url, options = {}) => {
      const token = getToken();
      return axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
        ...options
      });
    },
    [getToken]
  );


  const handleAuthError = useCallback(
    (error, setMessage) => {
      const errorMsg = error.response?.data?.error || "サーバーエラーが発生しました。";
      const errorSource = error.response?.data?.source;  // エラーのソースを取得
  
      if (errorSource == "authenticateToken") {
        removeToken();
        setMessage(errorMsg)
        setTimeout(() => router.push("/login"), 1000);
      } else if (setMessage) {
        setMessage(errorMsg);
      }
    },
    [router, removeToken]
  );
  
  useEffect(() => {
    const publicRoutes = ["/login", "/register"];

    const checkAuth = () => {
      const token = getToken();
      if (!token) {
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded) {
        removeToken();
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - currentTime;

      if (timeUntilExpiration <= 0) {
        removeToken();
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
      } else {
        setTimeout(checkAuth, timeUntilExpiration * 1000);
      }
    };

    if (!publicRoutes.includes(router.pathname)) {
      checkAuth();
    }
  }, [router, getToken, removeToken, decodeToken]);

  return {
    // 認証系ユーティリティ
    handleAuthError,
    getToken,
    setToken,
    removeToken,
    decodeToken,
    getAuthHeaders,

    // 認証付きAPI通信
    authGet,
    authPost,
    authPut,
    authDelete,
  };
};

export default useAuth;
