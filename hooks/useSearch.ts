"use client";
import { useState, useEffect, useRef } from "react";
import { SkinInfo } from "@/types";

export function useSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<SkinInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Abort in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/skins?q=${encodeURIComponent(query)}&limit=8`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.data ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, debounceMs]);

  return { results, loading, error };
}
