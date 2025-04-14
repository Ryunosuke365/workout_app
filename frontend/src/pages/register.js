import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/register.module.css";

// APIのエンドポイント（ユーザー登録用）
const API_URL = "https://loadlog.jp/api/register";

/**
 * 新規ユーザー登録画面コンポーネント
 */
const Register = () => {
  const router = useRouter();

  // フォーム入力状態
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    confirm_password: "",
  });

  // ユーザーへのメッセージ表示用
  const [message, setMessage] = useState("");

  // 入力補足説明（ツールチップ）の表示状態
  const [tooltip, setTooltip] = useState({ userId: false, password: false });

  /**
   * バリデーションルール
   */
  const VALIDATION = {
    userId: /^[A-Za-z0-9]{5,}$/,  // 英数字5文字以上
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,  // 大小英字+数字8文字以上
  };

  /**
   * フォーム入力ハンドラー
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * ツールチップの開閉制御
   */
  const toggleTooltip = (field) => {
    setTooltip((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  /**
   * フォーム入力内容のバリデーション
   * @returns {boolean} 検証OKかどうか
   */
  const validateForm = () => {
    const { user_id, password, confirm_password } = formData;

    if (!user_id || !password || !confirm_password) {
      setMessage("⚠️ すべての項目を入力してください。");
      return false;
    }

    if (password !== confirm_password) {
      setMessage("⚠️ パスワードが一致しません。");
      return false;
    }

    if (!VALIDATION.userId.test(user_id)) {
      setMessage("⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。");
      return false;
    }

    if (!VALIDATION.password.test(password)) {
      setMessage("⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return false;
    }

    return true;
  };

  /**
   * ユーザー登録処理
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("登録成功！ログインしてください。");
      } else {
        setMessage(data.error || "登録に失敗しました。");
      }
    } catch (error) {
      console.error("通信エラー:", error);
      setMessage("❌ サーバーに接続できませんでした。時間をおいて再試行してください。");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>新規登録</h2>

      {/* 登録フォーム */}
      <form onSubmit={handleRegister} className={styles.form}>
        {/* ユーザーID入力 */}
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
            onClick={() => toggleTooltip("userId")}
          >
            ❓
            {tooltip.userId && (
              <span className={styles.tooltip}>
                ユーザーIDは5文字以上の英数字のみで入力してください。
              </span>
            )}
          </span>
        </div>

        {/* パスワード入力 */}
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
            onClick={() => toggleTooltip("password")}
          >
            ❓
            {tooltip.password && (
              <span className={styles.tooltip}>
                パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。
              </span>
            )}
          </span>
        </div>

        {/* パスワード（確認）入力 */}
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

        <button type="submit" className={styles.button}>
          登録
        </button>
      </form>

      {/* メッセージ表示 */}
      {message && <p className={styles.message}>{message}</p>}

      {/* ログインページへのリンク */}
      <Link href="/login" legacyBehavior>
        <a className={styles.linkButton}>ログインページへ</a>
      </Link>
    </div>
  );
};

export default Register;
