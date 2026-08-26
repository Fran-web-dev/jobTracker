import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../utils/api";

export const useApiResource = (path, mapper = (item) => item) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const mapperRef = useRef(mapper);
  mapperRef.current = mapper;

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
        setData(list.map((item) => mapperRef.current(item)));
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
  }, [path, refreshKey]);

  return { data, error, loading, refresh };
};
