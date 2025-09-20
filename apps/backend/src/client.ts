import { hc } from "hono/client";
import type app from "./app"; // backend の Hono app

export type AppType = typeof app;
type ClientType = typeof hc<AppType>;

export const createClient = (
  ...args: Parameters<ClientType>
): ReturnType<ClientType> => {
  return hc<AppType>(...args);
};
