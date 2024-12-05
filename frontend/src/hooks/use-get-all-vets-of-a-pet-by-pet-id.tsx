import { User } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useGetAllVetsOfAPetByPetId = (petId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery<Record<string, User>>({
    queryKey: ["vetsOfPet", petId],
    queryFn: async () => {
      if (!petId) return {};
      const response = await fetch(`${baseUrl}/users/petId/${petId}`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const usersObject = (await response.json()) as Record<string, User>;
      return usersObject;
    },
    enabled: !!petId,
  });
  return {
    vetAssigneds: data || {},
    status,
    error,
  };
};
