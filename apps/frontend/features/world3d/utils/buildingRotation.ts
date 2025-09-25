import type { BuildingPartData } from "@/types";
import { calculateBuildingSize } from "./buildingCalculations";

/**
 * 建物データに全体回転を適用する
 * @param data 建物データ
 * @param yRotation Y軸回転（ラジアン）
 * @returns 回転が適用された建物データ
 */
export function applyRotationToBuilding(
  data: BuildingPartData,
  yRotation: number,
): BuildingPartData {
  return {
    ...data,
    rotation: [0, yRotation, 0], // Y軸回転のみ適用
  };
}

/**
 * 回転を考慮した建物の境界サイズを取得
 * @param data 建物データ
 * @param yRotation Y軸回転（ラジアン）
 * @returns [width, depth] グリッド単位でのサイズ
 */
export function getRotatedBounds(
  data: BuildingPartData,
  yRotation: number,
): [number, number] {
  // 回転を適用した仮データを作成してサイズ計算
  const rotatedData = applyRotationToBuilding(data, yRotation);
  return calculateBuildingSize(rotatedData);
}

/**
 * 度数をラジアンに変換
 * @param degrees 度数
 * @returns ラジアン
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * ラジアンを度数に変換
 * @param radians ラジアン
 * @returns 度数
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 90度刻みの回転を正規化（0, 90, 180, 270度のいずれかに丸める）
 * @param degrees 度数
 * @returns 正規化された度数
 */
export function normalizeRotation(degrees: number): number {
  // 0-360度の範囲に正規化
  const normalized = ((degrees % 360) + 360) % 360;

  // 90度刻みに丸める
  const result = Math.round(normalized / 90) * 90;

  // 360度を0度にマップ（360は無効な値のため）
  return result % 360;
}

/**
 * 回転方向を取得（時計回り/反時計回り）
 * @param fromDegrees 開始角度
 * @param toDegrees 終了角度
 * @returns 'clockwise' | 'counterclockwise'
 */
export function getRotationDirection(
  fromDegrees: number,
  toDegrees: number,
): "clockwise" | "counterclockwise" {
  const from = normalizeRotation(fromDegrees);
  const to = normalizeRotation(toDegrees);

  let diff = to - from;
  if (diff < 0) diff += 360;

  return diff <= 180 ? "clockwise" : "counterclockwise";
}
