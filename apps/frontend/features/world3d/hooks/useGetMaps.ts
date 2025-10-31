import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { client } from "@/lib/rpc-client";

const jsonNumberArrayParser = (json: string): [number, number, number] => {
  try {
    const data = JSON.parse(json);
    if (
      Array.isArray(data) &&
      data.length === 3 &&
      data.every((item) => typeof item === "number")
    ) {
      return data as [number, number, number];
    }
  } catch (error) {
    console.error(
      `Invalid JSON format: ${json} ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return [0, 0, 0];
};

const fetcherMaps = async () => {
  const res = await client.maps.$get();
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
};

export const useGetMaps = () => {
  const { data, error, isLoading, mutate } = useSWR("get-maps", fetcherMaps);
  return { maps: data, error, isLoading, mutate };
};

async function createMap(_key: string, { arg }: { arg: string }) {
  const res = await client.maps.$post({
    json: {
      name: arg,
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create map: ${res.status} ${msg}`);
  }
  return res.json();
}

export const useCreateMap = () => {
  const { trigger, isMutating } = useSWRMutation("create-map", createMap);
  return { trigger, isMutating };
};

const fetcherMap = (mapId: string) => async () => {
  const res = await client.maps[":id"].$get({
    param: {
      id: mapId,
    },
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const data = await res.json();
  const buildingData = {
    ...data,
    userObjects: data.userObjects.map((userObject) => ({
      ...userObject,
      position: userObject.position
        ? jsonNumberArrayParser(userObject.position)
        : undefined,
      rotation: userObject.rotation
        ? jsonNumberArrayParser(userObject.rotation)
        : undefined,
      boundingBox: jsonNumberArrayParser(userObject.boundingBox),
      parts: userObject.parts.map((part) => ({
        ...part,
        position: jsonNumberArrayParser(part.position),
        rotation: jsonNumberArrayParser(part.rotation),
        size: jsonNumberArrayParser(part.size),
      })),
    })),
  };
  return buildingData;
};

export const useGetMap = (mapId: string | undefined) => {
  const key = mapId ? `get-map-${mapId}` : null;
  const { data, error, isLoading } = useSWR(
    key,
    mapId ? fetcherMap(mapId) : null,
  );
  return { map: data, error, isLoading };
};

export const useGetMyTown = () => {
  const {
    maps,
    error: mapsError,
    isLoading: mapsLoading,
    mutate,
  } = useGetMaps();
  const { trigger: createMap, isMutating: isCreating } = useCreateMap();

  const [isInitializing, setIsInitializing] = useState(false);

  // マップがない場合の初期化処理（useEffectを使う）
  useEffect(() => {
    if (!maps || mapsLoading || isCreating || isInitializing) return;

    if (maps.length === 0) {
      setIsInitializing(true);
      createMap("First Town")
        .then(() => mutate())
        .finally(() => setIsInitializing(false));
    }
  }, [maps, mapsLoading, isCreating, isInitializing, createMap, mutate]);

  const firstMapId = maps?.[0]?.id;

  // マップ詳細（IDがある時だけ）
  const { map, error: mapError, isLoading: mapLoading } = useGetMap(firstMapId);

  const isLoading = mapsLoading || isCreating || isInitializing || mapLoading;
  const error = mapsError || mapError;

  return {
    isLoading,
    error,
    map,
    maps,
  };
};
