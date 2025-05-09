import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/HamburgerMenu.module.css";

// ハンバーガーメニューのコンポーネントです。
// 画面右上に配置され、クリックすることでメニューの表示/非表示を切り替えます。
// メニュー表示時にはオーバーレイが表示され、オーバーレイをクリックすることでもメニューを閉じることができます。
export default function HamburgerMenu() {
  // メニューの開閉状態を管理するstate (true: 開いている, false: 閉じている)
  const [isOpen, setIsOpen] = useState(false);

  // メニューの開閉状態をトグルします。
  // ボタンクリック時に呼び出され、親要素へのイベント伝播を防ぎます。
  const toggleMenu = (e) => {
    e.stopPropagation(); // 親要素へのイベント伝播を防止
    setIsOpen((prev) => !prev); // isOpenの値を反転させる
  };

  // メニューを閉じる関数です。
  // オーバーレイクリック時やメニュー項目選択時に呼び出されます。
  const closeMenu = () => {
    setIsOpen(false); // メニューを閉じる
  };

  return (
    <div className={styles.menuContainer}>
      {/* ハンバーガーメニューのアイコンボタン */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        ☰ {/* ハンバーガーアイコン */}
      </button>

      {/* isOpenがtrueの場合のみメニュー関連要素を描画 */}
      {isOpen && (
        <>
          {/* メニュー表示時に画面全体を覆うオーバーレイ */}
          {/* クリックするとメニューが閉じる */}
          <div className={styles.overlay} onClick={closeMenu} />

          {/* メニュー項目のリスト */}
          {/* リスト自体がクリックされてもメニューが閉じないようにイベント伝播を停止 */}
          <ul className={styles.menuList} onClick={(e) => e.stopPropagation()}>
            <li>
              <Link href="/measure" onClick={closeMenu}>
                計測
              </Link>
            </li>
            <li>
              <Link href="/history" onClick={closeMenu}>
                履歴
              </Link>
            </li>
            <li>
              <Link href="/setting" onClick={closeMenu}>
                設定
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}