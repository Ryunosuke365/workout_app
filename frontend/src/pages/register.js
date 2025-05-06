import { useState } from "react";
import Link from "next/link";
import stylesDesktop from "@/stylesDesktop/register.module.css";
import stylesMobile from "@/stylesMobile/register.module.css";
import useDeviceDetect from "@/hooks/useDeviceDetect";
import useAuth from "@/hooks/useAuth";

const API_URL = "https://loadlog.jp/api/register";

const Register = () => {
  const { handleAuthError, authPost } = useAuth();

  const { isMobile, styles } = useDeviceDetect(stylesDesktop, stylesMobile);
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");
  const [helpText, setHelpText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const { user_id, password, confirm_password } = formData;

    if (!user_id || !password || !confirm_password) {
      setMessage("すべての項目を入力してください。");
      return;
    }

    if (password !== confirm_password) {
      setMessage("パスワードが一致しません。");
      return;
    }

    if (!/^[A-Za-z\d]{4,16}$/.test(user_id)) {
      setMessage("ユーザーIDは4文字以上16文字以内の英数字のみで入力してください。");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/.test(password)) {
      setMessage("パスワードは8文字以上32文字以内で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authPost(API_URL, formData);
      setMessage(res.data.message);
      setFormData({ user_id: "", password: "", confirm_password: "" });
    } catch (err) {
      handleAuthError(err, setMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleHelp = (text) => {
    if (helpText === text) {
      setHelpText("");
    } else {
      setHelpText(text);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2 className={styles.heading2}>新規登録</h2>

      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            name="user_id"
            placeholder="ユーザーID"
            value={formData.user_id}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
          <span
            className={styles.questionMark}
            onClick={() => toggleHelp("ユーザーIDは5文字以上の英数字のみで入力してください。")}
          >
            ?
          </span>
        </div>

        <div className={styles.inputContainer}>
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            value={formData.password}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
          <span
            className={styles.questionMark}
            onClick={() => toggleHelp("パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。")}
          >
            ?
          </span>
        </div>

        <div className={styles.inputContainer}>
          <input
            type="password"
            name="confirm_password"
            placeholder="パスワード（確認）"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "登録中..." : "登録"}
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

      <Link href="/login" legacyBehavior>
        <a className={styles.linkButton}>ログインページへ</a>
      </Link>
      
      {helpText && <div className={styles.tooltip}>{helpText}</div>}
    </div>
  );
};

export default Register;
