"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  getDevice3DConfig,
  FRAME_COLOR_3D_PRESETS,
} from "@/lib/devices/deviceModels";
import type { DeviceConfig } from "@/lib/types/project";

interface Device3DLayerProps {
  device: DeviceConfig;
  imageUrl: string | undefined;
  width: number;
  height: number;
}

const gltfCache: Record<string, THREE.Group> = {};
const gltfLoading: Record<string, Promise<THREE.Group>> = {};

function loadGLTF(path: string): Promise<THREE.Group> {
  if (gltfCache[path]) return Promise.resolve(gltfCache[path]);
  if (gltfLoading[path]) return gltfLoading[path];
  const loader = new GLTFLoader();
  gltfLoading[path] = new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        gltfCache[path] = gltf.scene;
        delete gltfLoading[path];
        resolve(gltf.scene);
      },
      undefined,
      reject,
    );
  });
  return gltfLoading[path];
}

const TEX_PROPS = [
  "map", "normalMap", "roughnessMap", "metalnessMap",
  "aoMap", "emissiveMap", "alphaMap", "bumpMap",
  "displacementMap", "lightMap", "envMap",
] as const;

function sanitizeModelTextures(model: THREE.Group) {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    mesh.material = mats.map((m) => {
      const cloned = m.clone();
      for (const prop of TEX_PROPS) {
        const tex = (cloned as Record<string, unknown>)[prop] as THREE.Texture | null;
        if (tex) {
          const clonedTex = tex.clone();
          clonedTex.flipY = false;
          clonedTex.premultiplyAlpha = false;
          (cloned as Record<string, unknown>)[prop] = clonedTex;
        }
      }
      return cloned;
    });

    if (!Array.isArray(mesh.material) && Array.isArray(mats) && mats.length === 1) {
      mesh.material = (mesh.material as THREE.Material[])[0];
    }
  });
}

function createRoundedScreenImage(
  image: HTMLImageElement,
  cornerRadiusFactor: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const r = Math.round(w * cornerRadiusFactor);

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, 0, 0);

  return canvas;
}

function createScreenGeometry(w: number, h: number): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, 1 - uv.getY(i));
  }
  uv.needsUpdate = true;
  return geo;
}

export function Device3DLayer({
  device,
  imageUrl,
  width,
  height,
}: Device3DLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);
  const phoneModelRef = useRef<THREE.Group | null>(null);
  const screenPlaneRef = useRef<THREE.Mesh | null>(null);
  const baseScaleRef = useRef(1);
  const [ready, setReady] = useState(false);

  const config = useMemo(() => getDevice3DConfig(device.model), [device.model]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setReady(false);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    loadGLTF(config.modelPath).then((originalScene) => {
      if (!sceneRef.current) return;
      const phoneModel = originalScene.clone(true);

      sanitizeModelTextures(phoneModel);

      const box = new THREE.Box3().setFromObject(phoneModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 3.75 / maxDim;
      baseScaleRef.current = baseScale;

      phoneModel.scale.setScalar(baseScale);

      const so = config.screenOffset;
      phoneModel.position.set(
        -so.x * baseScale,
        -so.y * baseScale,
        -so.z * baseScale,
      );

      phoneModelRef.current = phoneModel;

      const pivot = new THREE.Group();
      pivot.add(phoneModel);
      pivotRef.current = pivot;
      scene.add(pivot);

      const planeHeight = 4.3 * config.screenHeightFactor;
      const planeWidth = planeHeight * config.aspectRatio;
      const geometry = createScreenGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({
        color: 0x111111,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const screenPlane = new THREE.Mesh(geometry, material);
      screenPlane.position.set(so.x, so.y, so.z);

      const mr = config.modelRotation;
      screenPlane.rotation.set(
        (-mr.x * Math.PI) / 180,
        (-mr.y * Math.PI) / 180,
        (-mr.z * Math.PI) / 180,
      );

      phoneModel.add(screenPlane);
      screenPlaneRef.current = screenPlane;

      setReady(true);
      renderer.render(scene, camera);
    });

    return () => {
      setReady(false);
      if (pivotRef.current) {
        pivotRef.current.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            for (const mat of mats) {
              if (!mat) continue;
              for (const prop of TEX_PROPS) {
                const tex = (mat as Record<string, unknown>)[prop] as THREE.Texture | null;
                tex?.dispose();
              }
              mat.dispose();
            }
          }
        });
      }
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      pivotRef.current = null;
      phoneModelRef.current = null;
      screenPlaneRef.current = null;
    };
  }, [config.modelPath]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    rendererRef.current.setSize(width, height);
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.render(sceneRef.current!, cameraRef.current);
  }, [width, height]);

  const render = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  useEffect(() => {
    if (!pivotRef.current) return;
    const mr = config.modelRotation;
    pivotRef.current.rotation.set(
      ((device.rotation.x + mr.x) * Math.PI) / 180,
      ((device.rotation.y + mr.y) * Math.PI) / 180,
      ((device.rotation.z + mr.z) * Math.PI) / 180,
    );
    render();
  }, [device.rotation, config.modelRotation, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!screenPlaneRef.current) return;
    if (!imageUrl) {
      const mat = screenPlaneRef.current.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = null;
      mat.color.set(0x111111);
      mat.needsUpdate = true;
      render();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!screenPlaneRef.current) return;
      const rounded = createRoundedScreenImage(img, config.cornerRadiusFactor);
      const tex = new THREE.Texture(rounded);
      tex.flipY = false;
      tex.premultiplyAlpha = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      const mat = screenPlaneRef.current.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = tex;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
      render();
    };
    img.src = imageUrl;
    return () => {
      img.onload = null;
    };
  }, [imageUrl, config.cornerRadiusFactor, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!phoneModelRef.current) return;
    const pid = device.frameColorPresetId;
    if (!pid) return;
    const presets = FRAME_COLOR_3D_PRESETS[device.model];
    const preset = presets?.find((p) => p.id === pid);
    if (!preset) return;

    phoneModelRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const matName = (
          (mesh.material as THREE.MeshStandardMaterial).name ?? ""
        ).toLowerCase();
        if (preset.materials[matName]) {
          (mesh.material as THREE.MeshStandardMaterial).color.set(
            preset.materials[matName],
          );
        }
      }
    });
    render();
  }, [device.frameColorPresetId, device.model, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
