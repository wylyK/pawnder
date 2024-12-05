import { User } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useUsersByUserIds = (userIds: string[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery<Record<string, User>>({
    queryKey: ["useUsersByUserIds", userIds],
    queryFn: async () => {
      if (!userIds || userIds.length === 0) return {};
      const queryString = `ids=${userIds.join(",")}`;
      const response = await fetch(`${baseUrl}/users/ids?${queryString}`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const usersObject = (await response.json()) as Record<string, User>;
      return usersObject;
    },
    enabled: userIds?.length > 0,
  });
  return {
    users: data ?? {},
    status,
    error,
  };
};
