import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { client } from "@/lib/rpc-client";

const jsonNumberArrayParser = (json: string) => {
  return JSON.parse(json) as [number, number, number];
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

async function createMap(url: string, { arg }: { arg: string }) {
  await client.maps.$post({
    json: {
      name: arg,
    },
  });
}

export const useCreateMap = () => {
  const { trigger, isMutating } = useSWRMutation(
    "create-map",
    (url, { arg }: { arg: string }) => createMap(url, { arg }),
  );
  return { trigger, isMutating };
};

/**
 * 1. /にアクセス
 * 2. get-mapsを呼び出す
 * 3. マップが存在しない場合はcreate-mapを呼び出す
 * 4. get-mapsをmutateする
 * 5. マップが存在する場合はマップを返す
 * 6. mapIdから詳細を取得
 *
 */

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
      position: jsonNumberArrayParser(userObject.position),
      rotation: jsonNumberArrayParser(userObject.rotation),
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

export const useGetMap = (mapId: string) => {
  const { data, error, isLoading } = useSWR(
    `get-map-${mapId}`,
    fetcherMap(mapId),
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
  const {
    map,
    error: mapError,
    isLoading: mapLoading,
  } = useGetMap(firstMapId ?? "");

  const isLoading = mapsLoading || isCreating || isInitializing || mapLoading;
  const error = mapsError || mapError;

  return {
    isLoading,
    error,
    map,
    maps,
  };
};
