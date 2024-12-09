import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/UserContext";
import { User } from "@/share/type";

export const useUser = () => {
    const { user } = useAuth();
    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

    const { data, status, error } = useQuery({
        queryKey: ["userProfile", user?.Id],
        queryFn: async () => {
            if (!user) throw new Error("User not authenticated");
            const response = await fetch(`${baseUrl}/users/${user.Id}`);
            if (!response.ok) {
                throw new Error(`Error fetching users: ${response.statusText}`);
            }
            const data = (await response.json()) as User;
            return data;
        },
        enabled: !!user,
    });

    const updateUser = useMutation({
        mutationFn: async ({ updatedUser }: { updatedUser: User }) => {
            if (!user) throw new Error("User not authenticated");
            const formData = new FormData();
            Object.entries(updatedUser).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });
            const response = await fetch(`${baseUrl}/users/${user.Id}`, {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Error updating user: ${response.statusText}`);
            }
            return response.json();
        },
    });
    return {
        userProfile: data,
        status,
        error,
        updateUser: updateUser.mutate,
    };
};
