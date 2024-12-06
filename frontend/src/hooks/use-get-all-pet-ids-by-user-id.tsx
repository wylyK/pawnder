import { useAuth } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPetIdsByUserId = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery({
    queryKey: ["petIds", user?.Id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const response = await fetch(`${baseUrl}/users/${user.Id}/pets`);
      if (!response.ok) {
        throw new Error(`Error fetching petIds: ${response.statusText}`);
      }
      const data = (await response.json()) as string[];
      return data || [];
    },
    enabled: !!user,
  });
  return {
    petIds: data,
    status,
    error,
  };
};
