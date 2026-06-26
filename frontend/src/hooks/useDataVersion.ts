import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useDataVersion = (intervalMs = 5000) => {
  const lastVersionRef = useRef<number | null>(null);

  const { data: version } = useQuery({
    queryKey: ["data-version"],
    queryFn: () =>
      axios
        .get(`/data.json?_v=${Date.now()}`, {
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        })
        .then((r) => r.data.version as number),
    refetchInterval: intervalMs,
    staleTime: 0,
  });

  useEffect(() => {
    if (version == null) return;
    if (lastVersionRef.current === null) {
      lastVersionRef.current = version;
    } else if (lastVersionRef.current !== version) {
      window.location.reload();
    }
  }, [version]);
};
