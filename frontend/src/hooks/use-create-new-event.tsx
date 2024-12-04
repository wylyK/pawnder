import { useAuth } from "@/context/UserContext";
import { useMutation } from "@tanstack/react-query";
import { PetEvent } from "@/share/type";

export const useCreateNewEvent = (petId: string) => {
  const user = useAuth();
  const useCreateNewEvent = useMutation({
    mutationFn: async (newEvent: PetEvent) => {
      if (!user || !user.user) throw new Error("User not authenticated");
      if (!petId) throw new Error("Pet ID is required");
      if (user.user.Role !== "vet") return null;
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

  return useCreateNewEvent;
};
