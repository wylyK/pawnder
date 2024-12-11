import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/UserContext";
import { Role } from "@/share/type";

export const useMatch = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const createMatch = useMutation({
    mutationFn: async ({
      petId,
      otherPetId,
    }: {
      petId: string;
      otherPetId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (!petId) throw new Error("Pet ID is required");
      if (user.Role !== Role.Owner)
        throw new Error("User does not have permission to create reminders");

        const response = await fetch(`${baseUrl}/pets/${petId}/matches`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ PetId: otherPetId }),
        });

      if (!response.ok) {
        throw new Error(`Error creating reminder: ${response.statusText}`);
      }
      return response.json();
    },
  });

//   const deleteMultipleReminders = useMutation({
//     mutationFn: async ({ reminderIds }: { reminderIds: string[] }) => {
//       if (!user) throw new Error("User not authenticated");
//       if (user.Role !== Role.Owner)
//         throw new Error("User does not have permission to delete reminders");

//       const response = await fetch(`${baseUrl}/pets/reminders/delete`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ reminderIds }),
//       });
//       if (!response.ok) {
//         throw new Error(
//           `Error deleting multiple reminders: ${response.statusText}`,
//         );
//       }
//       return response.json();
//     },
//   });

  return {
    sendRequest: createMatch.mutate,
  };
};
