import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/login.module.css";
import useAuth from "@/hooks/useAuth";

// APIのエンドポイントURL
const API_URL = "https://loadlog.jp/api/login";

// ログインページのコンポーネント
const Login = () => {
  const router = useRouter(); // useRouterフックでrouterオブジェクトを取得 (ページ遷移に使用)
  
  // useAuthフックから必要な関数を取得
  const { setToken, authPost, handleAuthError } = useAuth();
  // フォームの入力データを管理するstate
  const [formData, setFormData] = useState({ user_id: "", password: "" });
  // ユーザーへのメッセージを管理するstate
  const [message, setMessage] = useState("");
  // ローディング状態を管理するstate
  const [isLoading, setIsLoading] = useState(false);

  // ログイン処理を実行する関数
  const handleLogin = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信動作をキャンセル

    if (isLoading) return; // ローディング中は処理を中断

    const { user_id, password } = formData;

    // 入力チェック: ユーザーIDとパスワードが入力されているか
    if (!user_id || !password) {
      setMessage("すべての項目を入力してください。");
      return;
    }

    setIsLoading(true); // ローディング開始
    setMessage(""); // メッセージをクリア

    try {
      // APIにログインリクエストを送信
      const res = await authPost(API_URL, formData);
      // レスポンスからトークンとユーザーIDを取得して保存
      setToken(res.data.token, res.data.user_id);
      router.push("/measure"); // 計測ページへ遷移
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  // フォームの入力値が変更されたときにstateを更新する関数
  const handleInputChange = (e) => {
    const { name, value } = e.target; // イベントからname属性と入力値を取得
    setFormData((prev) => ({ ...prev, [name]: value })); // formDataを更新
    setMessage(""); // 入力時にメッセージをクリア
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>

      {/* ログインフォーム */}
      <form onSubmit={handleLogin} className={`${styles.card} card`}>
        <h2 className="section-header">ログイン</h2>

        {/* ユーザーID入力欄 */}
        <input
          className="form-control"
          type="text"
          name="user_id" // stateのキーと一致させる
          placeholder="ユーザーID"
          value={formData.user_id} // stateの値を表示
          onChange={handleInputChange} // 入力変更をハンドル
          required // HTML5のバリデーション
        />

        {/* パスワード入力欄 */}
        <input
          className="form-control"
          type="password"
          name="password" // stateのキーと一致させる
          placeholder="パスワード"
          value={formData.password} // stateの値を表示
          onChange={handleInputChange} // 入力変更をハンドル
          required // HTML5のバリデーション
        />

        {/* ログインボタン */}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading} // ローディング中は無効化
        >
          {isLoading ? "ログイン中…" : "ログイン"} {/* ローディング状態に応じてテキスト変更 */}
        </button>

        {/* メッセージ表示エリア (クリックでメッセージ消去) */}
        {message && (
          <p className="alert alert--warn" onClick={() => setMessage("")}>
            {message}
          </p>
        )}
      </form>

      {/* 新規登録ページへのリンク */}
      <Link href="/register" className="btn btn--success">
        新規登録ページへ
      </Link>
    </main>
  );
};

export default Login;
