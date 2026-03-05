import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: number) => {
      const cookies = authClient.getCookie();
      const headers = {
        Cookie: cookies,
      };
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: "DELETE",
        credentials: "omit",
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
