import { auth } from "@/lib/auth";
import { REDIS_GEO_KEY, type customerStatus } from "@/lib/constants";
import { db } from "@/lib/drizzle";
import { customer } from "@/lib/drizzle/schema";
import { envServer } from "@/lib/env-server";
import { redis } from "@/lib/redis";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  type CreateCustomerType,
} from "@/lib/schemas";
import type { GeoMember } from "@upstash/redis";
import { and, desc, eq, like, lt, or } from "drizzle-orm";

const limit = 100;

export async function GET(request: Request) {
  const headers = request.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const querySearch = url.searchParams.get("q");
  const status = url.searchParams.get("status");
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
  return Response.json({ customers, nextCursor });
}

export async function DELETE(request: Request) {
  const headers = request.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  await db
    .delete(customer)
    .where(
      and(eq(customer.id, Number(id)), eq(customer.userId, session.user.id)),
    );
  return Response.json({ message: "Customer deleted" });
}

export async function POST(request: Request) {
  const headers = request.headers;
  if (
    headers.get("Authorization") !== `Secret ${envServer.BETTER_AUTH_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: {
    customers: CreateCustomerType[];
    userId: string;
  } = await request.json();
  const customers = CreateCustomerSchema.array().parse(body.customers);
  if (!customers.length) {
    return Response.json(
      { error: "Missing customers, is empty" },
      { status: 400 },
    );
  }
  const userId = body.userId;
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
}

export async function PUT(request: Request) {
  const headers = request.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
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
  return Response.json({ message: "Customer updated" });
}
