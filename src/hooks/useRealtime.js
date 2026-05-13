import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export function useRealtime(table, filter, callback) {
  const channelRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, callback]);

  return channelRef;
}
