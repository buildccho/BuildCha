import type { BuildingPartData } from "@/types";

/**
 * BuildingPartDataから建物の占有サイズを計算する
 * @param data 建物データ
 * @returns [width, depth] グリッド単位でのサイズ
 */
export function calculateBuildingSize(
  data: BuildingPartData,
): [number, number] {
  if (!data.parts || data.parts.length === 0) return [1, 1];

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  data.parts.forEach((part) => {
    const [x, , z] = part.position;
    const [sizeX, , sizeZ] = part.size;

    // Y軸回転（ラジアン想定）
    const ry = Array.isArray(part.rotation) ? (part.rotation[1] ?? 0) : 0;

    const halfX = sizeX / 2;
    const halfZ = sizeZ / 2;

    // 回転矩形の軸揃え半径（XZ）
    const cos = Math.cos(ry);
    const sin = Math.sin(ry);
    const extentX = Math.abs(halfX * cos) + Math.abs(halfZ * sin);
    const extentZ = Math.abs(halfX * sin) + Math.abs(halfZ * cos);

    const partMinX = x - extentX;
    const partMaxX = x + extentX;
    const partMinZ = z - extentZ;
    const partMaxZ = z + extentZ;

    minX = Math.min(minX, partMinX);
    maxX = Math.max(maxX, partMaxX);
    minZ = Math.min(minZ, partMinZ);
    maxZ = Math.max(maxZ, partMaxZ);
  });

  const width = Math.ceil(maxX - minX);
  const depth = Math.ceil(maxZ - minZ);

  return [Math.max(1, width), Math.max(1, depth)];
}

/**
 * ホバーガイドのサイズを計算する
 * @param objectData 建物データ
 * @param cellSize セルサイズ
 * @param rotation Y軸回転（ラジアン）
 * @returns [width, depth] ピクセル単位でのサイズ
 */
export function calculateHoverGuideSize(
  objectData: { BuildingPartData: BuildingPartData } | null,
  cellSize: number,
  rotation?: number,
): [number, number] {
  if (!objectData?.BuildingPartData) return [cellSize, cellSize];

  let buildingData = objectData.BuildingPartData;

  // 回転が指定されている場合は回転を適用
  if (rotation !== undefined) {
    buildingData = {
      ...buildingData,
      rotation: [0, rotation, 0],
    };
  }

  const [width, depth] = calculateBuildingSize(buildingData);
  return [width * cellSize, depth * cellSize];
}
