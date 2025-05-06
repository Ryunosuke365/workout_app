/**
 * ユーザーのデバイスがモバイルかどうかを検出するユーティリティ
 */

/**
 * ユーザーのデバイスがモバイルデバイスかどうかを判定します
 * @returns {boolean} モバイルデバイスの場合はtrue、それ以外はfalse
 */
export const isMobileDevice = () => {
  // ユーザーエージェントをチェック
  const userAgent = 
    typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || window.opera : '';
  
  // モバイルデバイスのパターン
  const mobileRegex = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // 画面サイズもチェック（768px以下をモバイルとみなす）
  const isSmallScreen = 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  
  return mobileRegex.test(userAgent) || isSmallScreen;
};

/**
 * 現在の画面幅をチェックしてモバイルサイズかどうかを判定します
 * @returns {boolean} モバイルサイズの場合はtrue、それ以外はfalse
 */
export const isMobileScreenSize = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

/**
 * 画面のリサイズイベントをリッスンして、コールバック関数を実行します
 * @param {Function} callback 画面サイズが変更されたときに実行する関数
 * @returns {Function} イベントリスナーを削除するための関数
 */
export const addResizeListener = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}; 