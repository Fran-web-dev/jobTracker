import { useCallback, useEffect, useState } from "react";
import { getAuthToken } from "../utils/api";

export const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        const response = await fetch(url, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();
        setData(Array.isArray(jsonData) ? jsonData : jsonData.data ?? []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError);
          setData([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => controller.abort();
  }, [refreshKey, url]);

  return { data, loading, error, fetchData };
};
