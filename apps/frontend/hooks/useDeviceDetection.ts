"use client";
import { useEffect, useState } from "react";

type ScreenSize = "mobile" | "tablet" | "desktop";

type DeviceInfo = {
  isTouchDevice: boolean;
  screenSize: ScreenSize;
  isLandscape: boolean;
};

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isTouchDevice: false,
    screenSize: "desktop",
    isLandscape: true,
  });

  useEffect(() => {
    const detectDevice = () => {
      // タッチデバイス判定
      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

      // 画面サイズ判定
      const width = window.innerWidth;
      const height = window.innerHeight;

      let screenSize: ScreenSize;
      if (width < 768) {
        screenSize = "mobile";
      } else if (width < 1024) {
        screenSize = "tablet";
      } else {
        screenSize = "desktop";
      }

      // 横向き判定
      const isLandscape = width > height;

      setDeviceInfo({
        isTouchDevice,
        screenSize,
        isLandscape,
      });
    };

    // 初回判定
    detectDevice();

    // リサイズ・向き変更時の再判定
    const handleResize = () => {
      detectDevice();
    };

    const handleOrientationChange = () => {
      // orientationchange は遅延があるため setTimeout を使用
      setTimeout(detectDevice, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}
