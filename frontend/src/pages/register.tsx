import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/register.module.css";
import useAuth from "@/hooks/useAuth";

const API_URL = "http://3.112.2.147/api/register";

const Register = () => {
  const { handleAuthError, authPost } = useAuth();
  const [formData, setFormData] = useState({ user_id: "", password: "", confirm_password: "" });
  const [message, setMessage] = useState("");
  const [helpText, setHelpText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (err: any) {
      handleAuthError(err, setMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleHelp = (text: string) => {
    setHelpText((prev) => (prev === text ? "" : text));
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <form onSubmit={handleRegister} className={`${styles.card} card`}>
        <h2 className="section-header">新規登録</h2>
        <div className={styles.inputWrap}>
          <input className="form-control" type="text" name="user_id" placeholder="ユーザーID" value={formData.user_id} onChange={handleInputChange} required />
          <span className={styles.qm} onClick={() => toggleHelp("ユーザーIDは4〜16文字の英数字のみです。")}>?</span>
        </div>
        <div className={styles.inputWrap}>
          <input className="form-control" type="password" name="password" placeholder="パスワード" value={formData.password} onChange={handleInputChange} required />
          <span className={styles.qm} onClick={() => toggleHelp("8〜32文字で、大文字・小文字・数字をそれぞれ1文字以上含めてください。")}>?</span>
        </div>
        <div className={styles.inputWrap}>
          <input className="form-control" type="password" name="confirm_password" placeholder="パスワード（確認）" value={formData.confirm_password} onChange={handleInputChange} required />
        </div>
        <button type="submit" className="btn btn--primary" disabled={isLoading}>{isLoading ? "登録中…" : "登録"}</button>
        {message && <p className="alert alert--warn" onClick={() => setMessage("")}>{message}</p>}
      </form>
      <Link href="/login" className="btn btn--success">ログインページへ</Link>
      {helpText && <div className={styles.tooltip}>{helpText}</div>}
    </main>
  );
};

export default Register;