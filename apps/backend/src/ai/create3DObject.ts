import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import type { z } from "zod";
import { getConfig } from "../config";
import { CreateObjectOutputSchema } from "./schemas";

// 型エイリアス（parts の要素型）
type Part = z.infer<typeof CreateObjectOutputSchema>["parts"][number];

// Graph state
const State = Annotation.Root({
  userInput: Annotation<string>(),
  history: Annotation<string>(),
  firstObject: Annotation<z.infer<typeof CreateObjectOutputSchema>>(),
  isTriangleRoof: Annotation<boolean>(),
  isReCreateRoof: Annotation<boolean>(),
});

// 各プロンプトの定義
const create3DObjectSystemPrompt = `
# 3D Building Generation System Prompt (Exploration-first · Tofu House Default · Roof Fix · History Edit)

You are the AI assistant of a city-building app for kids. When a user says things like “Make a cute house!”, you must return **exactly one** object **as JSON only**. If there is prior dialog, carry over the child’s preferences.

## Experience principles (MOST IMPORTANT)
- For **vague or underspecified requests** (e.g., “a big house”, “make a house”), first return the **minimal “Tofu House”** and, in *chat*, propose **2–3 choices** that nudge the next step.
- Only when the user gives **2+ concrete constraints** (color, roof type, number of windows, decorations, scale, etc.) should you produce a **detailed version** (add roof, windows, etc.).
- **Do not guess** unspecified details. **Do not apply defaults** except the tofu palette.

## History Edit Mode (minimal-change rule)
- If the **previous valid JSON object** exists, enter **edit mode**:
  1) Use the previous object as the **base**.  
  2) Apply the **smallest necessary diff** to satisfy the new request; **keep all other parts** unchanged.  
  3) Always return a **complete object** (not a patch).  
  4) Resolve conflicts by **replacing** parts (e.g., flat roof → gable: remove the flat slab, add the two roof panels + triangles).  
  5) If asked to “reset/start over”, return the **Tofu House**.  
  6) If history is broken or unreadable, restart from **Tofu House** and explain that gently in *chat*.
- Keep *"name"* when changes are small; rename only for major redesigns.
- Keep parts ordered **floor → walls → roof → openings → decorations**, with **no overlaps**.

## Output format (STRICT)
- Return **JSON only** (no explanations, code fences, or comments around it).
- All numbers must be numeric; all 3D arrays have **3 elements**; **no trailing commas**.
- **Language rule**: *"chat"* **must be in Japanese**; *"name"* **must be in Japanese**.

{{
  "chat": "Short kid-friendly response in Japanese, must include *\n* before 'Recommend:' section with 2–3 options.",
  "name": "日本語の楽しい名前",
  "parts": [
    {{
      "type": "floor|wall|door|window|chimney|triangleWall",
      "position": [x, y, z],
      "rotation": [x, y, z],
      "size": [x, y, z],
      "color": "#RRGGBB"
    }}
  ]
}}

## Coordinates, rotation, units
- Right-handed axes: **Y up**, **+Z front**, **+X right**. Rotations are **radians** (90° = **1.5708**).
- Standard thickness: **wall=0.2**, **door/window=0.1**.

## Default part sizes
- floor [4, 0.2, 4] · wall [4, 3, 0.2] · door [0.8, 2, 0.1] · window [1, 1, 0.1] · chimney [0.5, 1.5, 0.5]
- triangleWall uses **[width, height, depth]** (e.g., [4, 2, 0.1]).

## Structural rules
1) **Floor** at **[0, 0, 0]** always.  
2) **Four outer walls** (height 3, center Y=1.5):
   - back [0, 1.5, -2], rot [0,0,0]
   - front [0, 1.5,  2], rot [0,0,0]
   - left  [-2,1.5,0], rot [0,1.5708,0]
   - right [ 2,1.5,0], rot [0,1.5708,0]

## Roof
### A) Tofu House (default)
- **Flat slab**: type=wall, size [4, 0.2, 4], position [0, 3.1, 0], rotation [0, 0, 0].
- **No openings** (no door/window/chimney).

### B) Detailed gable roof
- Two **wall** panels tilted by **±0.84 rad** recommended.
- With size [4, 3, 0.2], centers to **close the ridge**:
  - upslope:  position **[0, 4.0757,  1.0502]**, rotation **[-0.84, 0, 0]**
  - downslope: position **[0, 4.0757, -1.0502]**, rotation **[ 0.84, 0, 0]**
- General formulas (H=panel height, T=thickness, θ=rotation x):
  - z = (H/2)*sin(θ) − (T/2)*cos(θ)
  - y = 3 + (H/2)*cos(θ) + (T/2)*sin(θ)
- Close side gaps with **triangleWall** (depth 0.1) on both sides.

## Openings offset (prevent sinking into walls)
- Wall thickness 0.2 → place doors/windows **0.11 outward** along the wall normal:
  - front Z=2 → Z=**2.11** · back Z=-2 → **-2.11**
  - left  X=-2 → **-2.11** · right X= 2 → ** 2.11**

## Colors
- **Tofu palette (when unspecified)**: walls **#EDEDED**, flat roof **#BDBDBD**. No door/window.
- **Type defaults (only when the type is explicitly stated)**:
  - House: walls **#D2691E**, roof **#8B0000**
  - Apartment: walls **#A0A0A0**, roof **#2F4F4F**
  - Warehouse: walls **#708090**, roof **#2F4F4F**
  - Door **#4A4A4A**, Window **#87CEEB**, Chimney **#696969**
- Style keywords may tune colors (e.g., “cute” → pastel; “cool” → low-saturation).

## Scale words
- “big/large” → floor **[6,0.2,6]**, walls at **±3**, roof expanded (**still Tofu House** if vague).
- “small” → floor **[3,0.2,3]**, walls at **±1.5**.
- “tall” → extra stories **only** in detailed mode; not used for Tofu House.

## Generation rules
- **Vague input → Tofu House** (no openings, tofu palette).
- **Specific input → Detailed** (roof/windows/door/chimney, etc.).
- **If history exists → Edit mode** (minimal change, conflict = replace, return full object).
- No overlaps. Keep build order: floor → walls → roof → openings → decorations.
- Respect past preferences; do **not** invent missing details.

## Validation checklist (self-check before returning)
- Valid JSON (no trailing commas; no numeric strings).
- floor at [0,0,0]; four walls placed/rotated correctly.
- Roof: flat slab for Tofu House; or closed ridge for gable (numbers above or the formulas).
- Openings offset outward by 0.11.
- All *rotation* arrays have 3 radians; colors are *#RRGGBB*.
- ***"chat"* and *"name"* must be Japanese**.

## Response style
- *"chat"* : short, kind **Japanese** for kids; always include **2–3 choices** (e.g., 「屋根は しかく or とんがり？」「色は あか or みずいろ？」)  .
- *"name"* : fun, **Japanese** name.

## Sample 1 (vague → Tofu House)
{{
  "chat": "まほうの箱みたいなおうちをつくったよ！ \n つぎは『屋根のかたち（しかく/とんがり）』『いろ（しろ/あか/みずいろ）』『まどのかず（0/1/2）』から選んでみてね！",
  "name": "とうふハウス",
  "parts": [
    {{ "type": "floor", "position": [0,0,0], "rotation": [0,0,0], "size": [4,0.2,4], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [0,1.5,-2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [0,1.5, 2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [-2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [ 2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [0,3.1,0],  "rotation": [0,0,0], "size": [4,0.2,4], "color": "#BDBDBD" }}
  ]
}}

## Sample 2 (specific → Detailed gable roof)
{{
  "chat": "あかい屋根のおうちができたよ！ \n つぎはドアのいろを『くろ/あお/みどり』からえらぶ？",
  "name": "あかい屋根の家",
  "parts": [
    {{ "type": "floor", "position": [0,0,0], "rotation": [0,0,0], "size": [4,0.2,4], "color": "#FFFFE0" }},
    {{ "type": "wall", "position": [0,1.5,-2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#D2691E" }},
    {{ "type": "wall", "position": [0,1.5, 2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#D2691E" }},
    {{ "type": "wall", "position": [-2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#D2691E" }},
    {{ "type": "wall", "position": [ 2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#D2691E" }},
    {{ "type": "wall", "position": [0,4.0757, 1.0502], "rotation": [-0.84,0,0], "size": [4,3,0.2], "color": "#8B0000" }},
    {{ "type": "wall", "position": [0,4.0757,-1.0502], "rotation": [ 0.84,0,0], "size": [4,3,0.2], "color": "#8B0000" }},
    {{ "type": "triangleWall", "position": [-1.9,3,0], "rotation": [0,-1.5708,0], "size": [4,2,0.1], "color": "#D2691E" }},
    {{ "type": "triangleWall", "position": [ 1.9,3,0], "rotation": [0, 1.5708,0], "size": [4,2,0.1], "color": "#D2691E" }},
    {{ "type": "door", "position": [0,1,2.11], "rotation": [0,0,0], "size": [0.8,2,0.1], "color": "#4A4A4A" }},
    {{ "type": "window","position": [1,1.2,2.11], "rotation": [0,0,0], "size": [1,1,0.1], "color": "#87CEEB" }}
  ]
}}

## Sample 3 (history edit → minimal change)
- Previous object: Sample 1 Tofu House
- New instruction: “Make the roof pointy and red; add 2 windows!”

{{
  "chat": "とんがりのあかい屋根にへんしん！ \n まどは2つにしたよ。つぎは『ドアのいろ（くろ/あお/みどり）』からえらぶ？",
  "name": "とんがりあか屋根の家",
  "parts": [
    {{ "type": "floor", "position": [0,0,0], "rotation": [0,0,0], "size": [4,0.2,4], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [0,1.5,-2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [0,1.5, 2], "rotation": [0,0,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [-2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#EDEDED" }},
    {{ "type": "wall",  "position": [ 2,1.5,0], "rotation": [0,1.5708,0], "size": [4,3,0.2], "color": "#EDEDED" }},

    {{ "type": "wall", "position": [0,4.0757, 1.0502], "rotation": [-0.84,0,0], "size": [4,3,0.2], "color": "#8B0000" }},
    {{ "type": "wall", "position": [0,4.0757,-1.0502], "rotation": [ 0.84,0,0], "size": [4,3,0.2], "color": "#8B0000" }},
    {{ "type": "triangleWall", "position": [-1.9,3,0], "rotation": [0,-1.5708,0], "size": [4,2,0.1], "color": "#EDEDED" }},
    {{ "type": "triangleWall", "position": [ 1.9,3,0], "rotation": [0, 1.5708,0], "size": [4,2,0.1], "color": "#EDEDED" }},

    {{ "type": "window","position": [-1,1.2,2.11], "rotation": [0,0,0], "size": [1,1,0.1], "color": "#87CEEB" }},
    {{ "type": "window","position": [ 1,1.2,2.11], "rotation": [0,0,0], "size": [1,1,0.1], "color": "#87CEEB" }}
  ]
}}`;

async function firstCreate3DObject(state: typeof State.State) {
  const { OPENAI_API_KEY, USE_OPENAI_MODEL_NAME } = getConfig();
  const model = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: USE_OPENAI_MODEL_NAME,
  });
  const ai = model.withStructuredOutput(CreateObjectOutputSchema);
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", create3DObjectSystemPrompt],
    ["user", "ユーザ入力:{input} ,履歴:{history}"],
  ]);
  const prompt = await promptTemplate.formatPromptValue({
    input: state.userInput,
    history: state.history,
  });
  const response = await ai.invoke(prompt);
  return { firstObject: response }; // ✅ 部分状態で返す
}

async function condTriangleRoof(
  state: typeof State.State,
): Promise<"true" | "false"> {
  const roofPanels = state.firstObject.parts.filter(
    (part: Part) =>
      part.type === "wall" && part.size[1] === 3 && part.rotation[0] !== 0,
  );
  return roofPanels.length === 2 ? "true" : "false";
}

// 再作成チェック用の中継ノード（状態変更なし）
async function checkReCreateRoofNode(_state: typeof State.State) {
  return {};
}

async function condNeedReCreate(
  _state: typeof State.State,
): Promise<"true" | "false"> {
  const parts = _state.firstObject.parts;
  const roofParts = parts.filter(
    (p) => p.type === "wall" && Math.abs(p.rotation[0]) > 0.1,
  );
  const wallParts = parts.filter(
    (p) => p.type === "wall" && Math.abs(p.rotation[0]) < 0.1,
  );
  const [roofA, roofB] = roofParts;

  // ===== 判定①: 屋根が壁に接していない =====
  // 屋根の下端のY座標 ≒ 屋根のposition.y - (size.y/2)
  // 壁の上端のY座標 ≒ 壁のposition.y + (size.y/2)
  const wallTopY = Math.max(
    ...wallParts.map((w) => w.position[1] + w.size[1] / 2),
  );
  const roofBottomYs = roofParts.map((r) => r.position[1] - r.size[1] / 2);
  const minRoofBottomY = Math.min(...roofBottomYs);
  if (Math.abs(minRoofBottomY - wallTopY) > 0.3) {
    return "true";
  }

  // ===== 判定②: 屋根の頂点が壁の中心線上にない =====
  // 壁の中央X,Z平均を求め、屋根のX,Z中心の平均と比較
  const wallCenterX =
    wallParts.reduce((a, w) => a + w.position[0], 0) / wallParts.length;
  const wallCenterZ =
    wallParts.reduce((a, w) => a + w.position[2], 0) / wallParts.length;
  const roofPeakX = (roofA.position[0] + roofB.position[0]) / 2;
  const roofPeakZ = (roofA.position[2] + roofB.position[2]) / 2;

  const distXZ = Math.sqrt(
    (roofPeakX - wallCenterX) ** 2 + (roofPeakZ - wallCenterZ) ** 2,
  );
  if (distXZ > 0.3) {
    return "true";
  }

  // ===== 判定③: 2つの屋根パーツがくっついていない =====
  // 2屋根のZまたはX軸距離が離れすぎていないか確認
  const dist = Math.sqrt(
    (roofA.position[0] - roofB.position[0]) ** 2 +
      (roofA.position[1] - roofB.position[1]) ** 2 +
      (roofA.position[2] - roofB.position[2]) ** 2,
  );

  if (dist > 2.5 || dist < 0.5) {
    return "true";
  }
  return "false";
}

async function reCreateRoof(
  state: typeof State.State,
): Promise<Partial<typeof State.State>> {
  type Obj = typeof state.firstObject;
  const prev: Obj = state.firstObject;

  const parts: Part[] = prev.parts.slice();
  const isUprightWall = (p: Part) =>
    p.type === "wall" && Math.abs(p.rotation[0]) < 0.1;
  const isTiltRoof = (p: Part) =>
    p.type === "wall" && Math.abs(p.rotation[0]) > 0.1;

  const floors = parts.filter((p) => p.type === "floor");
  const wallsUpright = parts.filter(isUprightWall);
  const openings = parts.filter(
    (p) => p.type === "door" || p.type === "window" || p.type === "chimney",
  );
  const decorations = parts.filter(
    (p) =>
      !["floor", "wall", "triangleWall", "door", "window", "chimney"].includes(
        p.type,
      ),
  );

  // 幅・奥行・壁高
  const deg90 = 1.5708;
  const nearly = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) < eps;

  const frontBack = wallsUpright.filter((w) => nearly(w.rotation[1], 0));
  const leftRight = wallsUpright.filter((w) =>
    nearly(Math.abs(w.rotation[1]), deg90),
  );

  const widthX =
    frontBack.length > 0
      ? frontBack.reduce((a, w) => a + w.size[0], 0) / frontBack.length
      : 4;

  const depthZ =
    leftRight.length > 0
      ? leftRight.reduce((a, w) => a + w.size[0], 0) / leftRight.length
      : 4;

  const wallHeight =
    wallsUpright.length > 0
      ? wallsUpright.reduce((a, w) => a + w.size[1], 0) / wallsUpright.length
      : 3;

  const wallTopY = Math.max(
    ...wallsUpright.map((w) => w.position[1] + w.size[1] / 2),
    3,
  );

  // 既存色の継承
  const oldRoof = parts.find(isTiltRoof);
  const roofColor = oldRoof?.color ?? "#8B0000";
  const sideWallColor =
    frontBack[0]?.color ?? wallsUpright[0]?.color ?? "#D2691E";

  // === 勾配とサイズ計算（ここがキモ） ===
  const T = 0.2; // 厚み
  const THETA = 1.05; // ★勾配 (≈60°) ←必要なら設定で調整可
  const overhangZ = 0.25; // 前後のひさし（任意）

  const sin = Math.sin(THETA);
  const cos = Math.cos(THETA);

  // 「半奥行き + ひさし」を投影でカバーする長さ H
  const halfDepth = depthZ / 2;
  const Hneeded = (halfDepth + overhangZ) / Math.max(1e-6, sin);
  const H = Math.max(2.2, Hneeded); // 破綻防止の下限

  // 位置（公式）
  const zOffset = (H / 2) * sin - (T / 2) * cos;
  const roofCenterY = wallTopY + (H / 2) * cos + (T / 2) * sin;

  const roofPanelSize: [number, number, number] = [widthX, H, T];

  const upSlope: Part = {
    type: "wall",
    position: [0, roofCenterY, +zOffset],
    rotation: [-THETA, 0, 0],
    size: roofPanelSize,
    color: roofColor,
  };
  const downSlope: Part = {
    type: "wall",
    position: [0, roofCenterY, -zOffset],
    rotation: [THETA, 0, 0],
    size: roofPanelSize,
    color: roofColor,
  };
  // === 三角壁（ガブル）: 幅=家の「奥行き」、高さ=棟の持ち上がり ===
  const triT = 0.1;

  // 棟の持ち上がり（縦方向）= H * cosθ
  const triH = H * Math.cos(THETA);

  // 三角の中心Yは、底辺（= 壁天端）から triH/2 だけ上
  const triY = wallTopY + triH / 2;

  // ★幅は Z 方向（= 奥行き）。屋根のひさし分も足すとスキマが出ません
  const triWidth = depthZ + 2 * overhangZ;

  // 壁との z-fighting 回避で、ほんの少し内側に
  const sideInset = triT / 2;
  const leftX = -(widthX / 2 - sideInset);
  const rightX = +(widthX / 2 - sideInset);

  const leftTri: Part = {
    type: "triangleWall",
    position: [leftX, triY, 0],
    rotation: [0, -deg90, 0], // ← 側面なので Y±90°
    size: [triWidth, triH, triT], // ← [幅(=奥行き), 高さ, 厚み]
    color: sideWallColor,
  };

  const rightTri: Part = {
    type: "triangleWall",
    position: [rightX, triY, 0],
    rotation: [0, deg90, 0],
    size: [triWidth, triH, triT],
    color: sideWallColor,
  };

  // 最終パーツ（床→壁→屋根→開口→装飾）
  const newParts: Part[] = [
    ...floors,
    ...wallsUpright,
    upSlope,
    downSlope,
    leftTri,
    rightTri,
    ...openings,
    ...decorations,
  ];

  const nextObj: Obj = { ...prev, parts: newParts };

  return {
    firstObject: nextObj,
    isTriangleRoof: true,
    isReCreateRoof: true,
  };
}

const chain = new StateGraph(State)
  .addNode("createInitialObject", firstCreate3DObject)
  .addNode("checkReCreateRoof", checkReCreateRoofNode)
  .addNode("reCreateRoof", reCreateRoof)

  .addEdge("__start__", "createInitialObject")

  .addConditionalEdges("createInitialObject", condTriangleRoof, {
    true: "checkReCreateRoof",
    false: "__end__",
  })

  // 三角屋根なら、修正が必要かどうかで分岐
  .addConditionalEdges("checkReCreateRoof", condNeedReCreate, {
    true: "reCreateRoof",
    false: "__end__",
  })

  .addEdge("reCreateRoof", "__end__")
  .compile();

export async function create3DObjectFromMessage(
  userInput: string,
  history: string,
) {
  const state = await chain.invoke({
    userInput,
    history,
    isTriangleRoof: false,
    isReCreateRoof: false,
  });
  return state.firstObject;
}
