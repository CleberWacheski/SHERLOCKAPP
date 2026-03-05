import { auth } from "@/lib/auth";
import { REDIS_GEO_KEY } from "@/lib/constants";
import { db } from "@/lib/drizzle";
import { customer } from "@/lib/drizzle/schema";
import { redis } from "@/lib/redis";
import { inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const headers = request.headers;
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
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
  return Response.json({
    customers: customerMapper,
  });
}
