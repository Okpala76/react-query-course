import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
  const usersData = useQuery({
    queryKey: ['users', userId],
    queryFn: ({signal}) => fetch(`/api/users/${userId}`,{signal}).then(res => res.json()),
    staleTime: 1000*60
  });

  return usersData;
}
