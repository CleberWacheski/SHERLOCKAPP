import { authClient } from "@/lib/auth-client";
import type { customerStatus } from "@/lib/constants";
import { env } from "@/lib/env";
import { useInfiniteQuery } from "@tanstack/react-query";

interface FetchCustomersResponse {
  customers: {
    name: string;
    cpfCnpj: string;
    phone: string | null;
    status: (typeof customerStatus)[number];
    address: string | null;
    zipCode: string | null;
    city: string | null;
    state: string | null;
    note: string | null;
    id: number;
    createdAt: string | null;
    updatedAt: string;
  }[];
  nextCursor: number | null;
}

interface UseCustomersProps {
  status?: string;
  query?: string;
}

export function useCustomers({ status, query }: UseCustomersProps = {}) {
  return useInfiniteQuery({
    queryKey: ["customers", { status, query }],
    queryFn: async ({ pageParam }) => {
      const cookies = authClient.getCookie();
      const headers = {
        Cookie: cookies,
      };
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", String(pageParam));
      if (status) params.set("status", status);
      if (query) params.set("q", query);
      const response = await fetch(
        `${env.API_URL}/customers?${params.toString()}`,
        {
          credentials: "omit",
          headers,
        },
      );
      const data = (await response.json()) as FetchCustomersResponse;
      if (!data) {
        throw new Error("Failed to fetch customers");
      }

      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
