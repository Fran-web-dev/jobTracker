import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

const identity = (item) => item;

export const useApiResource = (path, mapper = identity) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadResource = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await apiRequest(path);
        if (cancelled) {
          return;
        }
        const list = Array.isArray(payload) ? payload : [];
        setData(list.map((item) => mapper(item)));
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setData([]);
        setError(requestError.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResource();

    return () => {
      cancelled = true;
    };
  }, [mapper, path, refreshKey]);

  return { data, error, loading, refresh };
};
