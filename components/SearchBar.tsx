"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input";
import { SkinInfo } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import Image from "next/image";

interface SearchBarProps {
  onSelect?: (skin: SkinInfo) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function SearchBar({
  onSelect,
  onQueryChange,
  placeholder = "Search CS2 skins... (e.g. AK-47 Case Hardened)",
  className,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { results, loading } = useSearch(query);

  useEffect(() => {
    setOpen(query.length >= 2 && results.length > 0);
  }, [query, results]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onQueryChange?.(e.target.value);
  };

  const handleSelect = (skin: SkinInfo) => {
    setQuery(skin.marketHashName);
    setOpen(false);
    onSelect?.(skin);
  };

  const handleClear = () => {
    setQuery("");
    onQueryChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        {loading ? (
          <Loader2 className="absolute left-3 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base bg-[#111111] border-[#222222] focus:border-primary"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#222222] rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            {results.map((skin) => (
              <button
                key={skin.id}
                onClick={() => handleSelect(skin)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors text-left"
              >
                {skin.imageUrl ? (
                  <Image
                    src={skin.imageUrl}
                    alt={skin.marketHashName}
                    width={40}
                    height={30}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-8 bg-[#1A1A1A] rounded" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {skin.marketHashName}
                  </p>
                  <p className="text-xs text-muted-foreground">{skin.weapon}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
