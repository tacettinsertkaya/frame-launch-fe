import { createStore, get, set, del } from "idb-keyval";

const store =
  typeof indexedDB !== "undefined" ? createStore("framelaunch-blobs", "blobs") : null;

export async function saveBlob(blob: Blob): Promise<string> {
  if (!store) throw new Error("IndexedDB not available");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await set(id, blob, store);
  return id;
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  if (!store) return undefined;
  return get<Blob>(id, store);
}

const objectUrlCache = new Map<string, string>();

export async function getBlobUrl(id: string): Promise<string | undefined> {
  if (objectUrlCache.has(id)) return objectUrlCache.get(id);
  const blob = await getBlob(id);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  objectUrlCache.set(id, url);
  return url;
}

export async function deleteBlob(id: string): Promise<void> {
  if (!store) return;
  await del(id, store);
  const url = objectUrlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    objectUrlCache.delete(id);
  }
}

export function clearObjectUrlCache(): void {
  for (const url of objectUrlCache.values()) URL.revokeObjectURL(url);
  objectUrlCache.clear();
}
