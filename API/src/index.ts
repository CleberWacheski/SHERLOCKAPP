import type { GeoMember } from "@upstash/redis";
import { and, desc, eq, inArray, like, lt, or } from "drizzle-orm";
import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { REDIS_GEO_KEY, type customerStatus } from "./lib/constants.js";
import { db } from "./lib/drizzle/index.js";
import { customer } from "./lib/drizzle/schema.js";
import { env } from "./lib/env.js";
import { redis } from "./lib/redis.js";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  type CreateCustomerType,
} from "./lib/schemas.js";

const app = new Hono();

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.get("/location", async (c) => {
  const headers = c.req.raw.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const lat = Number(c.req.query("lat"));
  const lon = Number(c.req.query("lon"));
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  const nearbyUsers = await redis.geosearch(
    REDIS_GEO_KEY,
    {
      type: "FROMLONLAT",
      coordinate: {
        lon,
        lat,
      },
    },
    {
      type: "BYRADIUS",
      radius: 100,
      radiusType: "KM",
    },
    "ASC",
    {
      withCoord: true,
    },
  );
  if (!nearbyUsers.length) {
    return Response.json({ customers: [] });
  }
  const customers = await db.query.customer.findMany({
    where: inArray(
      customer.id,
      nearbyUsers.map((user) => Number(user.member)),
    ),
    columns: {
      id: true,
      name: true,
      note: true,
      status: true,
    },
  });
  const nearbyMap = new Map(nearbyUsers.map((u) => [Number(u.member), u]));
  const customerMapper = customers
    .map((c) => {
      const nearbyUser = nearbyMap.get(c.id);
      if (!nearbyUser?.coord) return null;
      return {
        ...c,
        lat: nearbyUser.coord.lat,
        lon: nearbyUser.coord.long,
      };
    })
    .filter(Boolean);
  return c.json({
    customers: customerMapper,
  });
});

app.get("/customers", async (c) => {
  const limit = 100;
  const headers = c.req.raw.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cursor = c.req.query("cursor");
  const querySearch = c.req.query("q");
  const status = c.req.query("status");
  const customers = await db.query.customer.findMany({
    columns: {
      id: true,
      name: true,
      cpfCnpj: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      address: true,
      zipCode: true,
      city: true,
      state: true,
      note: true,
    },
    limit: limit + 1,
    orderBy: desc(customer.id),
    where: and(
      cursor ? lt(customer.id, Number(cursor)) : undefined,
      eq(customer.userId, session.user.id),
      querySearch
        ? or(
            like(customer.name, `%${querySearch}%`),
            like(customer.cpfCnpj, `%${querySearch}%`),
            like(customer.city, `%${querySearch}%`),
            like(customer.note, `%${querySearch}%`),
          )
        : undefined,
      status
        ? eq(customer.status, status as (typeof customerStatus)[number])
        : undefined,
    ),
  });
  let nextCursor = null;
  if (customers.length > limit) {
    const lastCustomer = customers.pop();
    nextCursor = lastCustomer?.id;
  }
  return c.json({ customers, nextCursor });
});

app.delete("/customers", async (c) => {
  const headers = c.req.raw.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = c.req.query("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  await db
    .delete(customer)
    .where(
      and(eq(customer.id, Number(id)), eq(customer.userId, session.user.id)),
    );
  return c.json({ message: "Customer deleted" });
});

app.post("/customers", async (c) => {
  const headers = c.req.raw.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (
    !session?.user.id &&
    headers.get("Authorization") !== `Secret ${env.BETTER_AUTH_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: {
    customers: CreateCustomerType[];
    userId: string;
  } = await c.req.json();
  const customers = CreateCustomerSchema.array().parse(body.customers);
  if (!customers.length) {
    return Response.json(
      { error: "Missing customers, is empty" },
      { status: 400 },
    );
  }
  const userId = session?.user.id || body.userId;
  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }
  const createdCustomers = await db
    .insert(customer)
    .values(
      customers.map((c) => ({
        ...c,
        lat: c.lat ? String(c.lat) : null,
        lon: c.lon ? String(c.lon) : null,
        userId,
      })),
    )
    .returning({
      id: customer.id,
      lat: customer.lat,
      lon: customer.lon,
    })
    .onConflictDoNothing();
  const geoCustomers: GeoMember<string>[] = createdCustomers
    .filter((c) => Number(c.lat) && Number(c.lon))
    .map((c) => ({
      latitude: Number(c.lat),
      longitude: Number(c.lon),
      member: c.id.toString(),
    }));
  for (const geo of geoCustomers) {
    await redis.geoadd(REDIS_GEO_KEY, geo);
  }
  return Response.json({ message: "Customers created" });
});

app.put("/customers", async (c) => {
  const headers = c.req.raw.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await c.req.json();
  const updateCustomer = UpdateCustomerSchema.parse(body);
  await db
    .update(customer)
    .set({
      status: updateCustomer.status,
      note: updateCustomer.note,
    })
    .where(
      and(
        eq(customer.id, updateCustomer.id),
        eq(customer.userId, session.user.id),
      ),
    );
  return c.json({ message: "Customer updated" });
});

export default app;
