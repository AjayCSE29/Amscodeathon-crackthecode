import { useCallback, useEffect, useState } from "react";
import { AuthError, apiGet } from "./api";

export function useAdminData<T>(
  token: string,
  path: string,
  onUnauthorized: () => void,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    let active = true;
    void apiGet<T>(token, path).then(
      (result) => {
        if (!active) return;
        setData(result);
        setError(null);
        setLoading(false);
      },
      (err: unknown) => {
        if (!active) return;
        if (err instanceof AuthError) {
          onUnauthorized();
          return;
        }
        setError(err instanceof Error ? err.message : "Request failed.");
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [token, path, onUnauthorized]);

  useEffect(() => reload(), [reload]);

  return { data, error, loading, reload };
}