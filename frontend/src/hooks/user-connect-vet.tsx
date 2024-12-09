import { useAuth } from "@/context/UserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../api";

export const useConnectVet = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  // Mutation for connecting a vet to a pet
  const connectVetMutation = useMutation({
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

  // Query for fetching pets by VetId
  const useFetchPetsByVetId = (vetId: string) => {
    return useQuery({
      queryKey: ["vetPets", vetId],
      queryFn: async () => {
        if (!vetId) throw new Error("VetId is required");
        const response = await api.get(`/pets/vet/${vetId}`);
        if (!response.data) {
          throw new Error("No pets found for this vet");
        }
        return response.data;
      },
      enabled: !!vetId, // Fetch only if vetId exists
    });
  };

  return {
    connectVet: connectVetMutation.mutateAsync, // Function to trigger the mutation
    connectVetStatus: connectVetMutation.status, // Current status ('idle' | 'loading' | 'success' | 'error')
    isConnecting: connectVetMutation.status === "pending", // Boolean for loading state
    connectVetError: connectVetMutation.error as Error | null, // Error object for connection
    fetchPetsByVetId: useFetchPetsByVetId, // Hook to fetch pets by VetId
  };
};
