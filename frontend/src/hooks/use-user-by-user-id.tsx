import { User } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useUserByUserId = (userId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery({
    queryKey: ["useUserByUserId", userId ? userId : null],
    queryFn: async () => {
      if (!userId) return null;

      const response = await fetch(`${baseUrl}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = (await response.json()) as User;
      return data || [];
    },
    enabled: !!userId,
  });

  return {
    user: data,
    status,
    error,
  };
};
