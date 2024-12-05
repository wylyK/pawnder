import { useAuth } from "@/context/UserContext";
import { PetEvent } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useAllEvents = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery({
    queryKey: ["events", user?.Id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const response = await fetch(`${baseUrl}/users/${user.Id}/events`);
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = (await response.json()) as PetEvent[];
      return data || [];
    },
    enabled: !!user,
  });

  return {
    allEvents: data,
    status,
    error,
  };
};
