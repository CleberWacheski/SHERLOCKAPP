import { authClient } from "@/lib/auth-client";
import type { UpdateCustomerType } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCustomerType) => {
      const cookies = authClient.getCookie();
      const headers = {
        Cookie: cookies,
      };
      const response = await fetch(`/api/customers`, {
        method: "PUT",
        credentials: "omit",
        headers,
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error("Failed to update customer");
      }
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", "location"] });
    },
  });
}
