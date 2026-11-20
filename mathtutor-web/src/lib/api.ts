/** Thin client helper for the server AI routes. */
export async function postJson<T>(url: string, body: unknown): Promise<{ ok: boolean; data?: T; error?: string; message?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error || "error", message: json.message || "אירעה שגיאה. נסו שוב." };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "network", message: "בעיית רשת. נסו שוב." };
  }
}

export async function postForm<T>(url: string, form: FormData): Promise<{ ok: boolean; data?: T; error?: string; message?: string }> {
  try {
    const res = await fetch(url, { method: "POST", body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error || "error", message: json.message || "אירעה שגיאה." };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "network", message: "בעיית רשת." };
  }
}
