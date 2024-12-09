import { useAuth } from "@/context/UserContext";
import { useMutation } from "@tanstack/react-query";

export const useConnectVet = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const mutation = useMutation({
    mutationFn: async ({ vetId, petId }: { vetId: string; petId: string }) => {
      if (!user) throw new Error("User not authenticated");

      const response = await fetch(`${baseUrl}/connect_vet/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VetId: vetId, PetId: petId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error connecting vet: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    },
  });

  return {
    connectVet: mutation.mutateAsync, // Function to trigger the mutation
    status: mutation.status, // Current status ('idle' | 'loading' | 'success' | 'error')
    isLoading: mutation.status === "pending", // Boolean for loading state
    isError: mutation.status === "error", // Boolean for error state
    error: mutation.error as Error | null, // Error object
    data: mutation.data, // Response data
  };
};
