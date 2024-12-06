import { PetEvent } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useGetAllEventsOfAPetByPetId = (petId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery({
    queryKey: ["eventsOfPet", petId],
    queryFn: async () => {
      if (!petId) return [];
      const response = await fetch(`${baseUrl}/pets/${petId}/events`);
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }
      const data = (await response.json()) as PetEvent[];
      return data || [];
    },
    enabled: !!petId,
  });
  return {
    eventsOfPet: data,
    status,
    error,
  };
};
