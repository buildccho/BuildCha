import { createClient } from "backend-workers";

const client = createClient(
  process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8787",
  {
    init: {
      credentials: "include",
    },
  },
);

export { client };
