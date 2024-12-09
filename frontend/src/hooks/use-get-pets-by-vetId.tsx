import { useQuery } from "@tanstack/react-query";

interface Pet {
  id: string;
  Name: string;
  Breed: string;
  Avatar: string;
  Owner: string;
}

export const useGetPetsByVetId = (vetId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const { data, status, error } = useQuery<Pet[]>({
    queryKey: ["petsByVetId", vetId],
    queryFn: async () => {
      if (!vetId) throw new Error("Vet ID is required to fetch pets.");

      const response = await fetch(`${baseUrl}/vets/${vetId}/pets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pets: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!vetId, // Fetch only if vetId is provided
  });

  return {
    pets: data || [],
    status,
    error,
  };
};
