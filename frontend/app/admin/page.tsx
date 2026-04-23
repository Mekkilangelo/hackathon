"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const MICHELIN_TYPES = ["ETOILE", "BIB_GOURMAND", "ETOILE_VERTE", "SELECTION"] as const;
type MichelinType = typeof MICHELIN_TYPES[number];

interface RestaurantRow {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: MichelinType;
  greenStar: boolean;
  location: string;
  country: string | null;
}

interface RestaurantFull extends RestaurantRow {
  address: string;
  zone: string | null;
  description: string;
  ambiance: string | null;
  tags: string[];
  websiteUrl: string | null;
  michelinUrl: string | null;
}

type FormData = Omit<RestaurantFull, "id">;

const EMPTY_FORM: FormData = {
  name: "", cuisine: "", priceRange: 2, michelinType: "SELECTION",
  greenStar: false, address: "", location: "", country: "",
  zone: "", description: "", ambiance: "", tags: [],
  websiteUrl: "", michelinUrl: "",
};

function adminHeaders(token: string) {
  const user = typeof window !== "undefined" ? localStorage.getItem("sebastianAdminUser") ?? "" : "";
  return { "Content-Type": "application/json", "x-admin-user": user, "x-admin-token": token };
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const LIMIT = 30;

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("sebastianAdminToken");
    const storedUser = localStorage.getItem("sebastianAdminUser");
    if (stored) { setToken(stored); if (storedUser) setLoginUser(storedUser); }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/admin/restaurants?limit=1`, {
      headers: { "x-admin-user": loginUser, "x-admin-token": loginInput },
    });
    if (res.ok) {
      localStorage.setItem("sebastianAdminUser", loginUser);
      localStorage.setItem("sebastianAdminToken", loginInput);
      setToken(loginInput);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("sebastianAdminToken");
    localStorage.removeItem("sebastianAdminUser");
    setToken(null);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const storedUser = localStorage.getItem("sebastianAdminUser") ?? "";
      const res = await fetch(`${BASE_URL}/admin/restaurants?${params}`, {
        headers: { "x-admin-user": storedUser, "x-admin-token": token },
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setRestaurants(data.restaurants);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setModal("create"); setEditId(null); };

  const openEdit = async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/restaurants/${id}`, {
      headers: { "x-admin-token": token! },
    });
    const r: RestaurantFull = await res.json();
    setForm({
      name: r.name, cuisine: r.cuisine, priceRange: r.priceRange,
      michelinType: r.michelinType, greenStar: r.greenStar,
      address: r.address, location: r.location, country: r.country ?? "",
      zone: r.zone ?? "", description: r.description, ambiance: r.ambiance ?? "",
      tags: r.tags, websiteUrl: r.websiteUrl ?? "", michelinUrl: r.michelinUrl ?? "",
    });
    setEditId(id);
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = modal === "edit"
        ? `${BASE_URL}/admin/restaurants/${editId}`
        : `${BASE_URL}/admin/restaurants`;
      await fetch(url, {
        method: modal === "edit" ? "PUT" : "POST",
        headers: adminHeaders(token!),
        body: JSON.stringify({ ...form, tags: typeof form.tags === "string" ? (form.tags as string).split(",").map((t) => t.trim()).filter(Boolean) : form.tags }),
      });
      setModal(null);
      fetchList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`${BASE_URL}/admin/restaurants/${deleteId}`, {
      method: "DELETE",
      headers: { "x-admin-token": token! },
    });
    setDeleteId(null);
    fetchList();
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs flex flex-col gap-4"
        >
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Accès admin
          </h2>
          <input
            type="text"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            placeholder="Nom d'utilisateur"
            autoComplete="username"
            className="h-11 px-4 rounded-xl text-sm border focus:outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <input
            type="password"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder="Mot de passe"
            autoComplete="current-password"
            className="h-11 px-4 rounded-xl text-sm border focus:outline-none"
            style={{ background: "var(--card)", borderColor: loginError ? "var(--rouge)" : "var(--border)", color: "var(--foreground)" }}
          />
          {loginError && <p className="text-xs" style={{ color: "var(--rouge)" }}>Mot de passe incorrect</p>}
          <button
            type="submit"
            className="h-11 rounded-xl text-sm font-semibold"
            style={{ background: "var(--rouge)", color: "white" }}
          >
            Connexion
          </button>
          <button type="button" onClick={() => router.push("/")} className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
            ← Retour à l'app
          </button>
        </form>
      </div>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col px-6 py-4 gap-4 max-w-5xl mx-auto w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher…"
          className="flex-1 h-9 px-3 rounded-lg text-sm border focus:outline-none min-w-0"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <button
          onClick={openCreate}
          className="h-9 px-4 rounded-lg text-sm font-semibold flex-shrink-0"
          style={{ background: "var(--or)", color: "#000" }}
        >
          + Nouveau
        </button>
        <button onClick={logout} className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {total.toLocaleString("fr")} restaurants au total
      </p>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
              {["Nom", "Cuisine", "Type", "€", "Lieu", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-3 py-2">
                      <div className="h-4 rounded bg-white/8 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : restaurants.map((r) => (
              <tr
                key={r.id}
                className="border-t transition-colors hover:bg-white/4"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-3 py-2 font-medium max-w-[180px] truncate">{r.name}</td>
                <td className="px-3 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>{r.cuisine}</td>
                <td className="px-3 py-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "var(--marine)", color: "var(--or)" }}>
                    {r.michelinType}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs font-mono" style={{ color: "var(--or)" }}>{"€".repeat(r.priceRange)}</td>
                <td className="px-3 py-2 text-xs max-w-[140px] truncate" style={{ color: "var(--muted-foreground)" }}>{r.location}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(r.id)} className="text-xs px-2 py-1 rounded" style={{ color: "var(--or)" }}>Éditer</button>
                    <button onClick={() => setDeleteId(r.id)} className="text-xs px-2 py-1 rounded" style={{ color: "var(--rouge)" }}>Sup.</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>←</button>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>→</button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 60%)" }}>
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl flex flex-col gap-4 p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
              {modal === "create" ? "Nouveau restaurant" : "Éditer le restaurant"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom" required><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
              <Field label="Cuisine" required><input required value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} /></Field>
              <Field label="Type Michelin">
                <select value={form.michelinType} onChange={e => setForm(f => ({ ...f, michelinType: e.target.value as MichelinType }))}>
                  {MICHELIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Budget (1-4)"><input type="number" min={1} max={4} value={form.priceRange} onChange={e => setForm(f => ({ ...f, priceRange: Number(e.target.value) }))} /></Field>
              <Field label="Adresse" required><input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></Field>
              <Field label="Location (ville, pays)" required><input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></Field>
              <Field label="Pays"><input value={form.country ?? ""} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></Field>
              <Field label="Zone"><input value={form.zone ?? ""} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} /></Field>
              <Field label="Site web" className="col-span-2"><input type="url" value={form.websiteUrl ?? ""} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} /></Field>
              <Field label="URL Michelin" className="col-span-2"><input type="url" value={form.michelinUrl ?? ""} onChange={e => setForm(f => ({ ...f, michelinUrl: e.target.value }))} /></Field>
              <Field label="Tags (virgule)" className="col-span-2">
                <input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} />
              </Field>
              <Field label="Ambiance" className="col-span-2"><input value={form.ambiance ?? ""} onChange={e => setForm(f => ({ ...f, ambiance: e.target.value }))} /></Field>
              <Field label="Description" className="col-span-2">
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="greenStar" checked={form.greenStar} onChange={e => setForm(f => ({ ...f, greenStar: e.target.checked }))} />
                <label htmlFor="greenStar" className="text-sm">Étoile Verte</label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setModal(null)} className="h-9 px-4 rounded-lg text-sm" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: "var(--rouge)", color: "white" }}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 60%)" }}>
          <div className="rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold">Supprimer ce restaurant ?</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-lg text-sm" style={{ background: "var(--muted)", color: "var(--foreground)" }}>Annuler</button>
              <button onClick={handleDelete} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: "var(--rouge)", color: "white" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, required, className }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
        {label}{required && " *"}
      </label>
      <div
        className="[&_input]:w-full [&_input]:h-9 [&_input]:px-3 [&_input]:rounded-lg [&_input]:text-sm [&_input]:border [&_input]:bg-transparent [&_input]:text-foreground [&_input]:outline-none
                   [&_select]:w-full [&_select]:h-9 [&_select]:px-3 [&_select]:rounded-lg [&_select]:text-sm [&_select]:border [&_select]:bg-transparent [&_select]:text-foreground [&_select]:outline-none
                   [&_textarea]:w-full [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:rounded-lg [&_textarea]:text-sm [&_textarea]:border [&_textarea]:bg-transparent [&_textarea]:text-foreground [&_textarea]:outline-none [&_textarea]:resize-none"
        style={{ "--tw-border-opacity": "1" } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
