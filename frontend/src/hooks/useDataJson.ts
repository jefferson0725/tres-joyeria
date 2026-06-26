import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const DATA_JSON_KEY = ["data-json"] as const;

const fetchDataJson = () =>
  axios
    .get<any>("/data.json", {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
    .then((r) => r.data);

export const useDataJson = () =>
  useQuery({
    queryKey: DATA_JSON_KEY,
    queryFn: fetchDataJson,
    staleTime: 1000 * 30,
  });
