import { authClient } from "@/lib/auth-client";
import { type CreateCustomerType } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: CreateCustomerType) => {
      const cookies = authClient.getCookie();
      const headers = {
        Cookie: cookies,
        "Content-Type": "application/json",
      };
      const response = await fetch("/api/customers", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customers: [customer],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
