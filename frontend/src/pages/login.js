import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/login.module.css";
import useAuth from "@/hooks/useAuth";

const API_URL = "https://loadlog.jp/api/login";

const Login = () => {
  const router = useRouter();
  
  const { setToken, authPost, handleAuthError } = useAuth();
  const [formData, setFormData] = useState({ user_id: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const { user_id, password } = formData;

    if (!user_id || !password) {
      setMessage("すべての項目を入力してください。");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await authPost(API_URL, formData);
      setToken(res.data.token, res.data.user_id);
      router.push("/measure");
    } catch (err) {
      handleAuthError(err, setMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>

      {/* ───────── ログインフォーム ───────── */}
      <form onSubmit={handleLogin} className={`${styles.card} card`}>
        <h2 className="section-header">ログイン</h2>

        <input
          className="form-control"
          type="text"
          name="user_id"
          placeholder="ユーザーID"
          value={formData.user_id}
          onChange={handleInputChange}
          required
        />

        <input
          className="form-control"
          type="password"
          name="password"
          placeholder="パスワード"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
        >
          {isLoading ? "ログイン中…" : "ログイン"}
        </button>

        {message && (
          <p className="alert alert--warn" onClick={() => setMessage("")}>
            {message}
          </p>
        )}
      </form>

      {/* ───────── 新規登録リンク ───────── */}
      <Link href="/register" className="btn btn--success">
        新規登録ページへ
      </Link>
    </main>
  );
};

export default Login;
