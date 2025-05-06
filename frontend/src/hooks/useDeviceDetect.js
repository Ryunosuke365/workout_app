import { useState, useEffect } from 'react';
import { isMobileDevice, isMobileScreenSize, addResizeListener } from '@/utils/deviceDetect';

/**
 * デバイスタイプを検出するカスタムフック
 * 
 * @returns {Object} - デバイス検出の結果と関連スタイル
 * @property {boolean} isMobile - モバイルデバイスかどうか
 * @property {Object} styles - 適用するスタイル (デスクトップまたはモバイル)
 */
export default function useDeviceDetect(stylesDesktop, stylesMobile) {
  // モバイルデバイス判定のための状態
  const [isMobile, setIsMobile] = useState(false);
  
  // 画面表示時とリサイズ時にデバイス判定を更新
  useEffect(() => {
    // 初期ロード時にデバイス判定
    setIsMobile(isMobileDevice());
    
    // リサイズイベントのリスナーを設定
    const cleanupResizeListener = addResizeListener(() => {
      setIsMobile(isMobileScreenSize());
    });
    
    // コンポーネントのアンマウント時にリスナーを削除
    return cleanupResizeListener;
  }, []);
  
  // デバイスタイプに応じたスタイルを選択
  const styles = isMobile ? stylesMobile : stylesDesktop;
  
  return { isMobile, styles };
} 