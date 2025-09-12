type Stroke = {
  width: number;
  color: string;
};

type Params = {
  /** text-shadow を生成するために使用されるストロークの配列 */
  strokes: [Stroke, ...Stroke[]];
  /** text-shadow が生成される方向の数 */
  directionCount?: number;
  /** ぼかし */
  blur?: number;
  /** text-shadow の半径のステップ間隔 */
  radiusStep?: number;
  /** 最外周の text-shadow 値の小数点以下の桁数 */
  digits?: number;
  /** 影のオフセット */
  shadowOffset?: number;
  /** 影の色 */
  shadowColor?: string;
};

export function generateTextShadow({
  strokes,
  directionCount = 8,
  blur = 0,
  radiusStep = strokes[0].width,
  digits = 0,
  shadowOffset = 0,
  shadowColor = strokes[0].color,
}: Params): string {
  const factor = 10 ** digits;
  const blurValue = `${blur}px`;
  const shadows: Set<string> = new Set();
  const shadowOffsets: Set<string> = new Set();
  const directions = [...Array(directionCount)].map((_, i) => {
    const angle = (2 * Math.PI * i) / directionCount;
    return [Math.cos(angle), Math.sin(angle)] as const;
  });

  let radius = 0;
  let currentMaxRadius = 0;

  for (const { width, color } of strokes) {
    currentMaxRadius += width;
    while (radius < currentMaxRadius) {
      radius = Math.min(radius + radiusStep, currentMaxRadius);
      for (const [dx, dy] of directions) {
        const x = Math.round(radius * dx * factor) / factor;
        const y = Math.round(radius * dy * factor) / factor;
        const valueX = `${x}px`;
        const valueY = `${y}px`;
        shadows.add(`${valueX} ${valueY} ${blurValue} ${color}`);
        if (shadowOffset) {
          const shadowX = Math.round((x + shadowOffset) * factor) / factor;
          const shadowY = Math.round((y + shadowOffset) * factor) / factor;
          const valueShadowX = `${shadowX}px`;
          const valueShadowY = `${shadowY}px`;
          shadowOffsets.add(
            `${valueShadowX} ${valueShadowY} ${blurValue} ${shadowColor}`,
          );
        }
      }
    }
  }

  const result = [...shadows, ...shadowOffsets].join(", ");
  return result;
}
