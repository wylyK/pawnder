import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/UserContext";
import { PetEvent, Role } from "@/share/type";

export const useCreateNewEvent = () => {
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async ({
      petId,
      newEvent,
    }: {
      petId: string;
      newEvent: PetEvent;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (!petId) throw new Error("Pet ID is required");
      if (user.Role !== Role.Vet)
        throw new Error("User does not have permission to create events");
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/pets/${petId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`);
      }
      return response.json();
    },
  });
  return mutation;
};
