// ハンバーガーメニューコンポーネント
import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/HamburgerMenu.module.css";

export default function HamburgerMenu() {
  // メニューの開閉状態を管理するstate
  const [isOpen, setIsOpen] = useState(false);

  // メニューの開閉を切り替える関数
  const toggleMenu = (e) => {
    e.stopPropagation(); // イベントの伝播を停止
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.menuContainer}>
      {/* ハンバーガーメニューボタン */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        ☰
      </button>

      {/* メニューが開いている場合のみ表示 */}
      {isOpen && (
        <ul className={styles.menuList}>
          <li>
            <Link href="/measure">
              計測
            </Link>
          </li>
          <li>
            <Link href="/history">
              履歴
            </Link>
          </li>
          <li>
            <Link href="/setting">
              設定
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}