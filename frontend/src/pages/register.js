import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/register.module.css";
import useAuth from "@/hooks/useAuth";

// APIのエンドポイントURL
const API_URL = "https://loadlog.jp/api/register";

// 新規登録ページのコンポーネント
const Register = () => {
  // useAuthフックから必要な関数を取得
  const { handleAuthError, authPost } = useAuth();
  // フォームの入力データを管理するstate
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    confirm_password: "",
  });
  // ユーザーへのメッセージを管理するstate
  const [message, setMessage] = useState("");
  // 入力フィールドのヘルプテキスト表示を管理するstate
  const [helpText, setHelpText] = useState("");
  // ローディング状態を管理するstate
  const [isLoading, setIsLoading] = useState(false);

  // 新規登録処理を実行する関数
  const handleRegister = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信動作をキャンセル

    if (isLoading) return; // ローディング中は処理を中断

    const { user_id, password, confirm_password } = formData;

    // 入力チェック: 全てのフィールドが入力されているか
    if (!user_id || !password || !confirm_password) {
      setMessage("すべての項目を入力してください。");
      return;
    }

    // 入力チェック: パスワードと確認用パスワードが一致するか
    if (password !== confirm_password) {
      setMessage("パスワードが一致しません。");
      return;
    }

    // 入力チェック: ユーザーIDの形式 (4-16文字の英数字)
    if (!/^[A-Za-z\d]{4,16}$/.test(user_id)) {
      setMessage("ユーザーIDは4文字以上16文字以内の英数字のみで入力してください。");
      return;
    }

    // 入力チェック: パスワードの形式 (8-32文字、大文字・小文字・数字を各1文字以上含む)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/.test(password)) {
      setMessage("パスワードは8文字以上32文字以内で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return;
    }

    setIsLoading(true); // ローディング開始

    try {
      // APIに新規登録リクエストを送信
      const res = await authPost(API_URL, formData);
      setMessage(res.data.message); // 成功メッセージを表示
      // フォームデータをクリア
      setFormData({ user_id: "", password: "", confirm_password: "" });
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
  };

  // ヘルプテキストの表示/非表示をトグルする関数
  const toggleHelp = (text) => {
    // 現在表示中のヘルプテキストと同じなら非表示に、異なればそのテキストを表示
    if (helpText === text) {
      setHelpText("");
    } else {
      setHelpText(text);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>

      {/* 新規登録フォーム */}
      <form onSubmit={handleRegister} className={`${styles.card} card`}>
        <h2 className="section-header">新規登録</h2>

        {/* ユーザーID入力欄とヘルプアイコン */}
        <div className={styles.inputWrap}>
          <input
            className="form-control"
            type="text"
            name="user_id" // stateのキーと一致させる
            placeholder="ユーザーID"
            value={formData.user_id} // stateの値を表示
            onChange={handleInputChange} // 入力変更をハンドル
            required // HTML5のバリデーション
          />
          {/* ヘルプアイコン: クリックでユーザーIDのヘルプテキストを表示/非表示 */}
          <span
            className={styles.qm}
            onClick={() =>
              toggleHelp("ユーザーIDは4〜16文字の英数字のみです。")
            }
          >
            ?
          </span>
        </div>

        {/* パスワード入力欄とヘルプアイコン */}
        <div className={styles.inputWrap}>
          <input
            className="form-control"
            type="password"
            name="password" // stateのキーと一致させる
            placeholder="パスワード"
            value={formData.password} // stateの値を表示
            onChange={handleInputChange} // 入力変更をハンドル
            required // HTML5のバリデーション
          />
          {/* ヘルプアイコン: クリックでパスワードのヘルプテキストを表示/非表示 */}
          <span
            className={styles.qm}
            onClick={() =>
              toggleHelp(
                "8〜32文字で、大文字・小文字・数字をそれぞれ1文字以上含めてください。"
              )
            }
          >
            ?
          </span>
        </div>

        {/* 確認用パスワード入力欄 */}
        <div className={styles.inputWrap}>
          <input
            className="form-control"
            type="password"
            name="confirm_password" // stateのキーと一致させる
            placeholder="パスワード（確認）"
            value={formData.confirm_password} // stateの値を表示
            onChange={handleInputChange} // 入力変更をハンドル
            required // HTML5のバリデーション
          />
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading} // ローディング中は無効化
        >
          {isLoading ? "登録中…" : "登録"} {/* ローディング状態に応じてテキスト変更 */}
        </button>

        {/* メッセージ表示エリア (クリックでメッセージ消去) */}
        {message && (
          <p className="alert alert--warn" onClick={() => setMessage("")}>
            {message}
          </p>
        )}
      </form>

      {/* ログインページへのリンク */}
      <Link href="/login" className="btn btn--success">
        ログインページへ
      </Link>

      {/* ヘルプテキスト表示エリア (ツールチップ風) */}
      {helpText && <div className={styles.tooltip}>{helpText}</div>}
    </main>
  );
};

export default Register;
