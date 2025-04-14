import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/login.module.css";
import useAuth from "@/hooks/useAuth";

// APIのエンドポイント（ログイン用）
const API_URL = "https://loadlog.jp/api/login";

/**
 * ログイン画面コンポーネント
 */
const Login = () => {
  const router = useRouter();
  const { setToken } = useAuth(); // 認証トークン操作用のカスタムフック

  // フォーム入力状態
  const [formData, setFormData] = useState({ user_id: "", password: "" });

  // ユーザーへのメッセージ表示用
  const [message, setMessage] = useState("");

  // ローディング状態（2重送信防止）
  const [isLoading, setIsLoading] = useState(false);

  /**
   * フォーム入力ハンドラー
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * ログイン処理
   * ・入力チェック
   * ・API通信
   * ・成功時はトークン保存 & 遷移
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return; // 2重クリック防止

    const { user_id, password } = formData;

    // フォーム未入力チェック
    if (!user_id || !password) {
      setMessage("⚠️ ユーザーIDとパスワードを入力してください。");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // トークンとユーザーIDの保存
        setToken(data.token, data.user_id);

        // 少し待ってから画面遷移
        setTimeout(() => {
          router.push("/measure");
        }, 100);
      } else {
        setMessage(data.error || "ログインに失敗しました。");
      }
    } catch (error) {
      console.error("通信エラー:", error);
      setMessage("サーバーに接続できませんでした。時間をおいて再試行してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>ログイン</h2>

      {/* ログインフォーム */}
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="text"
          name="user_id"
          placeholder="ユーザーID"
          value={formData.user_id}
          onChange={handleInputChange}
          className={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="パスワード"
          value={formData.password}
          onChange={handleInputChange}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      {/* メッセージ表示 */}
      {message && <p className={styles.message}>{message}</p>}

      {/* 新規登録ページへのリンク */}
      <Link href="/register" legacyBehavior>
        <a className={styles.linkButton}>新規登録ページへ</a>
      </Link>
    </div>
  );
};

export default Login;
