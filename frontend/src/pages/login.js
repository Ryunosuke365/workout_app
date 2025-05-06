import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import stylesDesktop from "@/stylesDesktop/login.module.css";
import stylesMobile from "@/stylesMobile/login.module.css";
import useAuth from "@/hooks/useAuth";
import useDeviceDetect from "@/hooks/useDeviceDetect";

const API_URL = "https://loadlog.jp/api/login";

const Login = () => {
  const router = useRouter();
  const { setToken, authPost, handleAuthError } = useAuth();
  
  const { isMobile, styles } = useDeviceDetect(stylesDesktop, stylesMobile);
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
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2 className={styles.heading2}>ログイン</h2>

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

      {message && <p className={styles.message}>{message}</p>}

      <Link href="/register" legacyBehavior>
        <a className={styles.linkButton}>新規登録ページへ</a>
      </Link>
    </div>
  );
};

export default Login;
