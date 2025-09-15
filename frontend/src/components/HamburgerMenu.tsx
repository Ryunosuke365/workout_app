import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/HamburgerMenu.module.css";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.menuContainer}>
      <button className={styles.menuButton} onClick={toggleMenu}>☰</button>
      {isOpen && (
        <ul className={styles.menuList}>
          <li><Link href="/measure">計測</Link></li>
          <li><Link href="/history">履歴</Link></li>
          <li><Link href="/setting">設定</Link></li>
        </ul>
      )}
    </div>
  );
}