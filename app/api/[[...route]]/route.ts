import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import oauth from "@/features/oauth/server/route";
import user from "@/features/user/server/route";

const app = new Hono();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .basePath("/api")
  .route("/auth", auth)
  .route("/oauth", oauth)
  .route("/user", user);

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
