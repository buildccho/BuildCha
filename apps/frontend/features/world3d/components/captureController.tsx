"use client";
import { useThree } from "@react-three/fiber";
import { forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

export type CaptureControllerHandle = {
  capture: () => Promise<Record<string, Blob>>;
};

type CaptureControllerProps = {
  target?: THREE.Object3D | THREE.Object3D[];
  padding?: number;
};

export const CaptureController = forwardRef<
  CaptureControllerHandle,
  CaptureControllerProps
>(({ target, padding = 1.5 }, ref) => {
  const { gl, scene, camera } = useThree();

  const captureView = async (
    position: [number, number, number],
    lookAt: [number, number, number],
  ): Promise<Blob> => {
    // カメラ位置を設定
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    camera.updateProjectionMatrix();

    // シーンをレンダリング
    gl.render(scene, camera);

    // Canvas内容を直接Blobに変換
    return new Promise((resolve, reject) => {
      gl.domElement.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to capture"));
      }, "image/png");
    });
  };

  const captureAllViews = async (): Promise<Record<string, Blob>> => {
    // カメラの元の状態を保存
    const origPos = camera.position.clone();
    const origQuat = camera.quaternion.clone();
    const origUp = camera.up.clone();

    try {
      // ターゲットオブジェクトの境界ボックスを計算
      const box = new THREE.Box3();

      if (target) {
        // ターゲットが指定されている場合、そのオブジェクトのみから境界を計算
        const targets = Array.isArray(target) ? target : [target];
        for (const obj of targets) {
          box.expandByObject(obj);
        }
      } else {
        // ターゲット未指定の場合はシーン全体から計算
        box.setFromObject(scene);
      }

      // 空の境界ボックスをチェック
      if (box.isEmpty()) {
        console.warn("Bounding box is empty, using default camera position");
        // デフォルト値を使用
        const defaultDistance = 10;
        const lookAt: [number, number, number] = [0, 0, 0];

        const views = {
          front: await captureView([0, 0, defaultDistance], lookAt),
          back: await captureView([0, 0, -defaultDistance], lookAt),
          left: await captureView([-defaultDistance, 0, 0], lookAt),
          right: await captureView([defaultDistance, 0, 0], lookAt),
          top: await captureView([0, defaultDistance, 0], lookAt),
          bottom: await captureView([0, -defaultDistance, 0], lookAt),
        };

        return views;
      }

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // サイズが0または無限大でないかチェック
      const sizeLengthSq = size.lengthSq();
      if (sizeLengthSq === 0 || !Number.isFinite(sizeLengthSq)) {
        console.warn(
          "Invalid bounding box size, using default camera position",
        );
        const defaultDistance = 10;
        const lookAt: [number, number, number] = [center.x, center.y, center.z];

        const views = {
          front: await captureView(
            [center.x, center.y, center.z + defaultDistance],
            lookAt,
          ),
          back: await captureView(
            [center.x, center.y, center.z - defaultDistance],
            lookAt,
          ),
          left: await captureView(
            [center.x - defaultDistance, center.y, center.z],
            lookAt,
          ),
          right: await captureView(
            [center.x + defaultDistance, center.y, center.z],
            lookAt,
          ),
          top: await captureView(
            [center.x, center.y + defaultDistance, center.z],
            lookAt,
          ),
          bottom: await captureView(
            [center.x, center.y - defaultDistance, center.z],
            lookAt,
          ),
        };

        return views;
      }

      // 最大サイズを取得してカメラ距離を計算
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      // paddingを適用
      const distance = (maxDim / 2 / Math.tan(fov / 2)) * padding;

      const lookAt: [number, number, number] = [center.x, center.y, center.z];

      const views = {
        front: await captureView(
          [center.x, center.y, center.z + distance],
          lookAt,
        ),
        back: await captureView(
          [center.x, center.y, center.z - distance],
          lookAt,
        ),
        left: await captureView(
          [center.x - distance, center.y, center.z],
          lookAt,
        ),
        right: await captureView(
          [center.x + distance, center.y, center.z],
          lookAt,
        ),
        top: await captureView(
          [center.x, center.y + distance, center.z],
          lookAt,
        ),
        bottom: await captureView(
          [center.x, center.y - distance, center.z],
          lookAt,
        ),
      };

      return views;
    } finally {
      // カメラの状態を元に戻す
      camera.position.copy(origPos);
      camera.quaternion.copy(origQuat);
      camera.up.copy(origUp);
      camera.updateMatrixWorld();

      // OrbitControlsなどのコントロールが存在する場合は更新
      const controls = gl as unknown as {
        controls?: { update?: () => void };
      };
      if (controls.controls && typeof controls.controls.update === "function") {
        controls.controls.update();
      }
    }
  };

  useImperativeHandle(ref, () => ({
    capture: captureAllViews,
  }));

  return null;
});

CaptureController.displayName = "CaptureController";
