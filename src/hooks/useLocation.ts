import { authClient } from "@/lib/auth-client";
import type { customerStatus } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

type NearbyUser = {
  lat: number;
  lon: number;
  status: (typeof customerStatus)[number];
  id: number;
  name: string;
  note: string | null;
};

interface FetchLocationResponse {
  customers: NearbyUser[];
}

interface UseLocationProps {
  coords: {
    lat: number;
    lon: number;
  } | null;
}

export function useLocation({ coords }: UseLocationProps) {
  return useQuery({
    queryKey: ["location", coords?.lat, coords?.lon],
    enabled: Boolean(coords),
    queryFn: async () => {
      if (!coords) return { nearbyUsers: [] };
      const cookies = authClient.getCookie();
      const headers = {
        Cookie: cookies,
      };
      const params = new URLSearchParams();
      params.set("lat", String(coords.lat));
      params.set("lon", String(coords.lon));
      const response = await fetch(`/api/location?${params.toString()}`, {
        credentials: "omit",
        headers,
      });
      const data = (await response.json()) as FetchLocationResponse;
      if (!data) {
        throw new Error("Failed to fetch location");
      }
      return {
        nearbyUsers: data.customers,
      };
    },
  });
}
