import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/HamburgerMenu.module.css";

/**
 * ハンバーガーメニュー用コンポーネント
 * ・画面右上のメニュー表示/非表示を制御
 * ・オーバーレイクリックで閉じる
 */
export default function HamburgerMenu() {
  // メニュー開閉状態
  const [isOpen, setIsOpen] = useState(false);

  /**
   * メニューの開閉を切り替える
   * @param e クリックイベント
   */
  const toggleMenu = (e) => {
    e.stopPropagation();  // 親要素へのイベント伝播を防止
    setIsOpen((prev) => !prev);
  };

  /**
   * メニューを閉じる
   */
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.menuContainer}>
      {/* メニューボタン */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        ☰
      </button>

      {/* メニュー表示時のみ描画 */}
      {isOpen && (
        <>
          {/* オーバーレイ：クリックでメニューを閉じる */}
          <div className={styles.overlay} onClick={closeMenu} />

          {/* メニューリスト */}
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
