import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/UserContext";
import { PetEvent, Role } from "@/share/type";

export const useEvent = () => {
  const { user } = useAuth();
  const createEvent = useMutation({
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

  const updateEvent = useMutation({
    mutationFn: async ({
      petId,
      eventId,
      updatedEvent,
    }: {
      petId: string;
      eventId: string;
      updatedEvent: PetEvent;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (!petId) throw new Error("Pet ID is required");
      if (user.Role !== Role.Vet)
        throw new Error("User does not have permission to update events");
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl}/pets/${petId}/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        },
      );
      if (!response.ok) {
        throw new Error(`Error updating event: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      if (!user) throw new Error("User not authenticated");
      if (user.Role !== Role.Vet)
        throw new Error("User does not have permission to delete events");
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/pets/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error deleting event: ${errorText || response.statusText}`,
        );
      }
      if (response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
      }
      return null;
    },
  });

  return {
    createEvent: createEvent.mutate,
    createEventStatus: createEvent.status,
    updateEvent: updateEvent.mutate,
    updateEventStatus: updateEvent.status,
    deleteEvent: deleteEvent.mutate,
    deleteEventStatus: deleteEvent.status,
  };
};
