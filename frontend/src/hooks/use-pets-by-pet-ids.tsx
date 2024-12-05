import { Pet } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const usePetsByPetIds = (petIds: string[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery<Record<string, Pet>>({
    queryKey: ["usePetsBPetIds", petIds],
    queryFn: async () => {
      if (!petIds || petIds.length === 0) return {};
      const queryString = `ids=${petIds.join(",")}`;
      const response = await fetch(`${baseUrl}/pets/ids?${queryString}`);
      if (!response.ok) {
        throw new Error(`Error fetching pets: ${response.statusText}`);
      }
      const petsObject = (await response.json()) as Record<string, Pet>;
      return petsObject;
    },
    enabled: petIds?.length > 0,
  });
  return {
    pets: data ?? {},
    status,
    error,
  };
};
