import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../utils/api";

const identity = (item) => item;

export const useApiResource = (path, mapper = identity, options = {}) => {
  const { enabled = Boolean(path), single = false } = options;
  const emptyData = useMemo(() => (single ? null : []), [single]);
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !path) {
      return undefined;
    }

    let cancelled = false;

    const loadResource = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await apiRequest(path);
        if (cancelled) {
          return;
        }
        if (single) {
          setData(payload ? mapper(payload) : null);
        } else {
          const list = Array.isArray(payload) ? payload : [];
          setData(list.map((item) => mapper(item)));
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setData(emptyData);
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
  }, [emptyData, enabled, mapper, path, refreshKey, single]);

  return {
    data: enabled ? data : emptyData,
    error: enabled ? error : "",
    loading: enabled ? loading : false,
    refresh,
  };
};
