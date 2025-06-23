interface UseUserIdReturn {
  userId: string;
}

export function useUserId(): UseUserIdReturn {
  let userId = localStorage.getItem("uid");

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("uid", userId);
  }

  return {
    userId,
  };
}
