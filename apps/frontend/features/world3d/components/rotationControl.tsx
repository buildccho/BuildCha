"use client";
import { Html } from "@react-three/drei";
import { RotateCw } from "lucide-react";

type RotationControlProps = {
  visible: boolean;
  currentRotation: number;
  onRotate: () => void;
  position: [number, number, number];
  isTouchDevice: boolean;
};

export default function RotationControl({
  visible,
  currentRotation,
  onRotate,
  position,
  isTouchDevice,
}: RotationControlProps) {
  if (!visible) return null;

  return (
    <Html position={position} center>
      <div
        className="rotation-controls relative"
        style={{ pointerEvents: "auto" }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        {/* メイン回転ボタン */}
        <button
          type="button"
          onClick={onRotate}
          aria-label="建物を90度回転"
          className={`rotation-btn ${isTouchDevice ? "touch-optimized" : ""} 
            ${isTouchDevice ? "min-w-12 min-h-12 text-2xl" : "min-w-9 min-h-9 text-base"} 
            rounded-full bg-blue-600 text-white border-none shadow-lg cursor-pointer flex items-center justify-center font-sans transition-all duration-200 ease-in-out`}
          style={{
            transform: "translateZ(0)", // GPU加速
          }}
          onMouseEnter={(e) => {
            if (!isTouchDevice) {
              e.currentTarget.style.transform = "scale(1.1) translateZ(0)";
              e.currentTarget.style.backgroundColor = "#0056b3";
            }
          }}
          onMouseLeave={(e) => {
            if (!isTouchDevice) {
              e.currentTarget.style.transform = "scale(1) translateZ(0)";
              e.currentTarget.style.backgroundColor = "#007bff";
            }
          }}
          onTouchStart={(e) => {
            if (isTouchDevice) {
              e.currentTarget.style.transform = "scale(0.95) translateZ(0)";
              e.currentTarget.style.backgroundColor = "#0056b3";
            }
          }}
          onTouchEnd={(e) => {
            if (isTouchDevice) {
              e.currentTarget.style.transform = "scale(1) translateZ(0)";
              e.currentTarget.style.backgroundColor = "#007bff";
            }
          }}
        >
          <RotateCw />
        </button>

        {/* 方向インジケータ */}
        <div
          className="direction-indicator absolute -top-2 -right-2 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-xs shadow-md transition-transform duration-300 ease-in-out"
          style={{
            transform: `rotate(${-(currentRotation * 180) / Math.PI}deg)`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            ➤
          </span>
        </div>
      </div>
    </Html>
  );
}
