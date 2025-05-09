import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// 認証関連の共通処理をまとめたカスタムフック
const useAuth = () => {
  const router = useRouter();

  // ローカルストレージからトークンを取得する関数
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // ローカルストレージにトークンとユーザーIDを保存する関数
  const setToken = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    if (userId) {
      localStorage.setItem("user_id", userId);
    }
  }, []);

  // ローカルストレージからトークンとユーザーIDを削除する関数 (ログアウト処理)
  const removeToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }, []);

  // トークンをデコードしてペイロードを取得する関数
  // Bearerプレフィックスが付いている場合は除去する
  const decodeToken = useCallback((token) => {
    try {
      if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1]; // "Bearer "部分を除去
      }
      return jwtDecode(token); // トークンをデコード
    } catch {
      return null; // デコード失敗時はnullを返す
    }
  }, []);

  // APIリクエスト用の認証ヘッダーを取得する関数
  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`, // Bearerトークンを付与
      },
    };
  }, [getToken]);

  // 認証付きGETリクエストを送信する関数
  const authGet = useCallback(
    async (url) => {
      const token = getToken();
      return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  // 認証付きPOSTリクエストを送信する関数
  const authPost = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  // 認証付きPUTリクエストを送信する関数
  const authPut = useCallback(
    async (url, data) => {
      const token = getToken();
      return axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [getToken]
  );

  // 認証付きDELETEリクエストを送信する関数
  const authDelete = useCallback(
    async (url, options = {}) => {
      const token = getToken();
      return axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
        ...options, // その他のオプションを展開
      });
    },
    [getToken]
  );

  // 認証エラーを処理する関数
  // エラーの種類に応じてメッセージ表示やログインページへのリダイレクトを行う
  const handleAuthError = useCallback(
    (error, setMessage) => {
      const errorMsg = error.response?.data?.error || "サーバーエラーが発生しました。";
      const errorSource = error.response?.data?.source; // エラーの発生源を特定

      // トークン認証エラーの場合、トークンを削除しログインページへ遷移
      if (errorSource === "authenticateToken") {
        removeToken();
        setMessage(errorMsg);
        setTimeout(() => router.push("/login"), 1000); // 1秒後にログインページへ
      } else if (setMessage) {
        // その他のエラーはメッセージを表示
        setMessage(errorMsg);
      }
    },
    [router, removeToken]
  );

  // 副作用フック: 認証状態をチェックし、必要に応じてリダイレクトやトークン更新処理を行う
  useEffect(() => {
    // 認証が不要な公開ルート
    const publicRoutes = ["/login", "/register"];

    // 認証状態をチェックする内部関数
    const checkAuth = () => {
      const token = getToken();
      // トークンがない場合
      if (!token) {
        // 公開ルート以外ならログインページへリダイレクト
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
        return;
      }

      // トークンをデコード
      const decoded = decodeToken(token);
      // デコード失敗 (不正なトークンなど)
      if (!decoded) {
        removeToken(); // トークンを削除
        // 公開ルート以外ならログインページへリダイレクト
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
        return;
      }

      // トークンの有効期限をチェック
      const currentTime = Math.floor(Date.now() / 1000); // 現在時刻 (秒単位)
      const timeUntilExpiration = decoded.exp - currentTime; // 有効期限までの残り時間 (秒)

      // トークンが期限切れの場合
      if (timeUntilExpiration <= 0) {
        removeToken(); // トークンを削除
        // 公開ルート以外ならログインページへリダイレクト
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
      } else {
        // トークンが有効な場合、有効期限が切れるタイミングで再度認証チェックを行う
        setTimeout(checkAuth, timeUntilExpiration * 1000);
      }
    };

    // 現在のパスが公開ルートでない場合に認証チェックを実行
    if (!publicRoutes.includes(router.pathname)) {
      checkAuth();
    }
    // router, getToken, removeToken, decodeToken が変更された時に再実行
  }, [router, getToken, removeToken, decodeToken]);

  return {
    // 認証関連ユーティリティ関数
    handleAuthError,
    getToken,
    setToken,
    removeToken,
    decodeToken,
    getAuthHeaders,

    // 認証付きAPI通信関数
    authGet,
    authPost,
    authPut,
    authDelete,
  };
};

export default useAuth;
