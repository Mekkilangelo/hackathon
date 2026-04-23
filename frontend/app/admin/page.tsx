"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface AdminRestaurant {
  id: string;
  name: string;
  cuisine: string;
  michelinType: string;
  priceRange: number;
  zone: string | null;
  location: string;
  greenStar: boolean;
}

const MICHELIN_OPTIONS = ["ETOILE", "BIB_GOURMAND", "ETOILE_VERTE", "SELECTION"];

const PRICE_LABEL: Record<number, string> = { 1: "€", 2: "€€", 3: "€€€", 4: "€€€€" };

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Formulaire vide ────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", cuisine: "", priceRange: 2, michelinType: "SELECTION",
  greenStar: false, address: "", location: "Paris", country: "France",
  zone: "", description: "", ambiance: "", imageUrl: "", tags: "",
  websiteUrl: "", michelinUrl: "",
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  async function login() {
    setAuthError("");
    try {
      await apiFetch("/admin/restaurants", token);
      setAuthed(true);
      loadRestaurants(token);
    } catch {
      setAuthError("Token invalide ou serveur inaccessible.");
    }
  }

  async function loadRestaurants(t = token) {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<AdminRestaurant[]>("/admin/restaurants", t);
      setRestaurants(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(r: AdminRestaurant) {
    setForm({
      name: r.name, cuisine: r.cuisine, priceRange: r.priceRange,
      michelinType: r.michelinType, greenStar: r.greenStar,
      address: "", location: r.location, country: "France",
      zone: r.zone ?? "", description: "", ambiance: "", imageUrl: "",
      tags: "", websiteUrl: "", michelinUrl: "",
    });
    setEditId(r.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce restaurant ?")) return;
    try {
      await apiFetch(`/admin/restaurants/${id}`, token, { method: "DELETE" });
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(`Erreur : ${e}`);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl: form.imageUrl || null,
        websiteUrl: form.websiteUrl || null,
        michelinUrl: form.michelinUrl || null,
        zone: form.zone || null,
        ambiance: form.ambiance || null,
        country: form.country || null,
      };

      if (editId) {
        await apiFetch(`/admin/restaurants/${editId}`, token, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/admin/restaurants", token, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setShowForm(false);
      loadRestaurants();
    } catch (e) {
      alert(`Erreur : ${e}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-bold text-gray-900">Back Office Sebastian</h1>
          <p className="text-sm text-gray-500">Entrez le token admin pour accéder.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="ADMIN_TOKEN"
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {authError && <p className="text-xs text-red-600">{authError}</p>}
          <button
            onClick={login}
            className="h-10 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Accéder →
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">
              {editId ? "Modifier" : "Ajouter"} un restaurant
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
          </div>

          {[
            { key: "name", label: "Nom *" },
            { key: "cuisine", label: "Cuisine *" },
            { key: "address", label: "Adresse *" },
            { key: "location", label: "Ville *" },
            { key: "zone", label: "Quartier" },
            { key: "description", label: "Description *", multiline: true },
            { key: "ambiance", label: "Ambiance" },
            { key: "imageUrl", label: "Image URL" },
            { key: "tags", label: "Tags (séparés par virgule)" },
            { key: "websiteUrl", label: "Site de réservation" },
            { key: "michelinUrl", label: "URL Michelin" },
          ].map(({ key, label, multiline }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">{label}</label>
              {multiline ? (
                <textarea
                  rows={3}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Type Michelin *</label>
              <select
                value={form.michelinType}
                onChange={(e) => setForm((f) => ({ ...f, michelinType: e.target.value }))}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none"
              >
                {MICHELIN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Budget *</label>
              <select
                value={form.priceRange}
                onChange={(e) => setForm((f) => ({ ...f, priceRange: Number(e.target.value) }))}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none"
              >
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{PRICE_LABEL[n]}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.greenStar}
              onChange={(e) => setForm((f) => ({ ...f, greenStar: e.target.checked }))}
              className="w-4 h-4"
            />
            Étoile Verte (engagement durable)
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 h-10 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : editId ? "Modifier" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Liste ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Back Office — Restaurants</h1>
            <p className="text-xs text-gray-400">{restaurants.length} restaurants</p>
          </div>
          <button
            onClick={openCreate}
            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500 text-center py-8">Chargement...</p>}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {!loading && restaurants.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Cuisine</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Prix</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Zone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r, i) => (
                  <tr key={r.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.cuisine}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {r.michelinType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{PRICE_LABEL[r.priceRange]}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{r.zone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && restaurants.length === 0 && !error && (
          <p className="text-sm text-gray-500 text-center py-8">Aucun restaurant. Commencez par en ajouter un.</p>
        )}
      </div>
    </div>
  );
}
