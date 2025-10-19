"use client";
import { useThree } from "@react-three/fiber";
import { forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

export type CaptureControllerHandle = {
  capture: () => Promise<Record<string, Blob>>;
};

type CaptureControllerProps = {
  // 追加のpropsが必要な場合はここに定義
};

export const CaptureController = forwardRef<
  CaptureControllerHandle,
  CaptureControllerProps
>((props, ref) => {
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
    // モデルの境界ボックスを計算
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 最大サイズを取得してカメラ距離を計算
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    // 余白を持たせるために1.5倍
    const distance = (maxDim / 2 / Math.tan(fov / 2)) * 1.5;

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
      top: await captureView([center.x, center.y + distance, center.z], lookAt),
      bottom: await captureView(
        [center.x, center.y - distance, center.z],
        lookAt,
      ),
    };

    return views;
  };

  useImperativeHandle(ref, () => ({
    capture: captureAllViews,
  }));

  return null;
});

CaptureController.displayName = "CaptureController";
