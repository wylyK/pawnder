import { useAuth } from "@/context/UserContext";
import { PetReminder } from "@/share/type";
import { useQuery } from "@tanstack/react-query";

export const useGetAllRemindersByUserId = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const { data, status, error } = useQuery({
    queryKey: ["reminders", user?.Id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const response = await fetch(`${baseUrl}/users/${user.Id}/reminders`);
      if (!response.ok) {
        throw new Error(`Error fetching reminders: ${response.statusText}`);
      }
      const data = (await response.json()) as PetReminder[];
      return data || [];
    },
    enabled: !!user,
  });
  return {
    remindersOfUser: data,
    status,
    error,
  };
};
