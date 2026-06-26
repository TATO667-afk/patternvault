"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PriceAlertConfig } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

export function AlertManager() {
  const [alerts, setAlerts] = useState<PriceAlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAlert = async (id: string, isActive: boolean) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a))
    );
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Price Alerts</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Alert
        </Button>
      </div>

      <AnimatePresence>
        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-8 text-muted-foreground"
          >
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No alerts set</p>
          </motion.div>
        )}

        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded-lg border ${
              alert.triggered
                ? "border-success/30 bg-success/5"
                : alert.isActive
                ? "border-[#222222] bg-[#111111]"
                : "border-[#1A1A1A] bg-[#0D0D0D] opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {alert.skin?.marketHashName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alert when price goes{" "}
                  <span className={alert.condition === "below" ? "text-success" : "text-danger"}>
                    {alert.condition}
                  </span>{" "}
                  {formatPrice(alert.targetPrice)}
                  {alert.marketplace && ` on ${alert.marketplace}`}
                </p>
                {alert.triggered && (
                  <Badge variant="success" className="text-xs mt-1">
                    Triggered
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleAlert(alert.id, alert.isActive)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  {alert.isActive ? (
                    <ToggleRight className="h-4 w-4 text-primary" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
