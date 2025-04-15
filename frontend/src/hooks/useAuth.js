import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// 認証関連の共通処理をまとめたカスタムフック
const useAuth = () => {
  const router = useRouter();

  /**
   * ローカルストレージからトークンを取得
   */
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  /**
   * ローカルストレージにトークンとユーザーIDを保存
   * @param token トークン
   * @param userId ユーザーID（任意）
   */
  const setToken = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    if (userId) {
      localStorage.setItem("user_id", userId);
    }
  }, []);

  /**
   * ローカルストレージからトークンとユーザーIDを削除（ログアウト処理）
   */
  const removeToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }, []);

  /**
   * トークンをデコードして中身を取得
   * Bearer プレフィックス対応
   * @param token JWTトークン
   * @returns デコード結果 or null
   */
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

  /**
   * APIリクエスト用のヘッダー情報（認証付き）
   */
  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [getToken]);

  /**
   * 認証付きGETリクエスト
   */
  const authGet = useCallback(
    async (url) => {
      const token = getToken();
      return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  /**
   * 認証付きPOSTリクエスト
   */
  const authPost = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  /**
   * 認証付きPUTリクエスト
   */
  const authPut = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  /**
   * 認証付きDELETEリクエスト
   * @param {string} url リクエストURL
   * @param {Object} options オプション（data等）
   */
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

  /**
   * 認証エラー時の共通処理
   * ・トークン削除
   * ・ログイン画面への遷移
   * ・エラーメッセージ表示
   * @param error エラーオブジェクト
   * @param setMessage メッセージSetter
   * @param customErrorMessage 任意の表示メッセージ
   * @param suppressUIMessage メッセージ非表示フラグ
   */
  const handleAuthError = useCallback(
    (error, setMessage, customErrorMessage = null, suppressUIMessage = false) => {
      const status = error.response?.status;
      const message = error.message;

      // 認証エラーの場合の処理
      if (
        status === 403 ||
        status === 401 ||
        message?.includes("403") ||
        message?.includes("トークンが存在しません")
      ) {
        removeToken();
        if (setMessage) {
          setMessage("セッションが切れました。再ログインしてください。");
        }
        setTimeout(() => router.push("/login"), 1000);
      } else if (setMessage && !suppressUIMessage) {
        const errorMsg = customErrorMessage || "サーバーエラーが発生しました。";
        setMessage(errorMsg);
      }
    },
    [router, removeToken]
  );

  /**
   * 認証状態のチェックと自動ログアウト処理
   * ・初期表示時に実行
   * ・トークンの有無・有効期限を確認
   * ・期限切れなら自動ログアウト
   */
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
