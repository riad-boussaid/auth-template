import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import user from "@/features/user/server/route";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app.route("/auth", auth).route("/user", user);

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
