import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/UserContext";
import { PetReminder, Role } from "@/share/type";

export const useReminder = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const createReminder = useMutation({
    mutationFn: async ({
      petId,
      newReminder,
    }: {
      petId: string;
      newReminder: PetReminder;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (!petId) throw new Error("Pet ID is required");
      if (user.Role !== Role.Owner)
        throw new Error("User does not have permission to create reminders");

      const response = await fetch(`${baseUrl}/pets/${petId}/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      });
      if (!response.ok) {
        throw new Error(`Error creating reminder: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // const deleteReminder = useMutation({
  //     mutationFn: async ({ reminderId }: { reminderId: string }) => {
  //         if (!user) throw new Error("User not authenticated");
  //         if (user.Role !== Role.Owner)
  //             throw new Error("User does not have permission to delete reminders");

  //         const response = await fetch(`${baseUrl}/pets/reminders/${reminderId}`, {
  //             method: "DELETE",
  //         });
  //         if (!response.ok) {
  //             throw new Error(`Error deleting reminder: ${response.statusText}`);
  //         }
  //         return response.json();
  //     }
  // });

  const deleteMultipleReminders = useMutation({
    mutationFn: async ({ reminderIds }: { reminderIds: string[] }) => {
      if (!user) throw new Error("User not authenticated");
      if (user.Role !== Role.Owner)
        throw new Error("User does not have permission to delete reminders");

      const response = await fetch(`${baseUrl}/pets/reminders/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminderIds }),
      });
      if (!response.ok) {
        throw new Error(
          `Error deleting multiple reminders: ${response.statusText}`,
        );
      }
      return response.json();
    },
  });

  return {
    createReminder: createReminder.mutate,
    deleteMultipleReminders: deleteMultipleReminders.mutate,
  };
};
