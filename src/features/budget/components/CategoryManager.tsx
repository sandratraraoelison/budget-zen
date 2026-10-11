"use client";
import { useState } from "react";
import { Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useBudget } from "../context/BudgetProvider";
import {
  TRANSACTION_CATEGORIES,
  getCategoryLabel,
} from "../domain/categorization";
import { categoryIcons, categoryIcon } from "../domain/category-icons";
import type { CustomCategory } from "../types";
export default function CategoryManager() {
  const { state, saveCategory, removeCategory, reorderCategories, pending } =
    useBudget();
  const [editing, setEditing] = useState<CustomCategory | null>(null);
  const [error, setError] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const rows = [
    ...TRANSACTION_CATEGORIES.filter(
      (key) => !(state.hiddenCategories ?? []).includes(key),
    ).map((key) => ({
      id: `base:${key}`,
      name: getCategoryLabel(key).replace(/^\S+\s*/, ""),
      baseCategory: key,
      icon: (
        {
          salaire: "wallet",
          loyer: "home",
          nourriture: "food",
          transport: "car",
          loisirs: "gift",
          "sant\u00e9": "heart",
          "\u00e9ducation": "book",
          autres: "tag",
        } as Record<string, string>
      )[key],
      budget: 0,
      spent: 0,
      transactions: [],
      createdAt: new Date(),
    })),
    ...state.customCategories,
  ].sort((a, b) => {
    const rank = (id: string) => {
      const n = state.categoryOrder?.indexOf(id) ?? -1;
      return n < 0 ? 10000 : n;
    };
    return rank(a.id) - rank(b.id);
  });
  async function move(id: string, to: number) {
    const ids = rows.map((c) => c.id);
    const from = ids.indexOf(id);
    if (from === to || from < 0 || to < 0 || to >= ids.length) return;
    ids.splice(from, 1);
    ids.splice(to, 0, id);
    try {
      await reorderCategories(ids);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save() {
    if (!editing) return;
    try {
      if (!editing.name.trim()) throw new Error("Le nom est obligatoire.");
      await saveCategory(
        {
          ...editing,
          name: editing.name.trim(),
          id:
            editing.id.startsWith("base:") || editing.id === "new"
              ? crypto.randomUUID()
              : editing.id,
        },
        editing.id.startsWith("base:") || editing.id === "new",
      );
      setEditing(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(c: CustomCategory) {
    if (
      !confirm(
        "Supprimer cette catégorie ? Ses transactions seront déplacées vers Autres et son budget sera retiré.",
      )
    )
      return;
    try {
      await removeCategory(c.id);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="ui-card mt-6">
      <h2 className="ui-title mb-4">Catégories</h2>
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      {!editing && (
        <button
          type="button"
          className="ui-primary mb-4"
          disabled={pending}
          onClick={() =>
            setEditing({
              id: "new",
              name: "",
              icon: "tag",
              budget: 0,
              spent: 0,
              transactions: [],
              createdAt: new Date(),
            })
          }
        >
          Ajouter une catégorie
        </button>
      )}
      {editing ? (
        <div className="space-y-4">
          <label className="block">
            Nom
            <input
              className="block w-full p-3 border"
              value={editing.name}
              maxLength={100}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Icône">
            {Object.entries(categoryIcons).map(([key, icon]) => (
              <button
                type="button"
                key={key}
                aria-label={key}
                aria-pressed={editing.icon === key}
                className={`ui-icon-button ${editing.icon === key ? "ring-2 ring-teal-500" : ""}`}
                onClick={() => setEditing({ ...editing, icon: key })}
              >
                {icon}
              </button>
            ))}
          </div>
          <button
            className="ui-primary"
            disabled={pending}
            onClick={() => void save()}
          >
            Enregistrer
          </button>
          <button
            className="ui-secondary ml-2"
            disabled={pending}
            onClick={() => setEditing(null)}
          >
            Annuler
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-700/20">
          {rows.map((c, index) => (
            <li
              key={c.id}
              className={`flex items-center justify-between gap-3 py-3 ${dragged === c.id ? "opacity-50" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragged && !pending) void move(dragged, index);
                setDragged(null);
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  className="ui-icon-button cursor-grab active:cursor-grabbing"
                  draggable={!pending}
                  disabled={pending}
                  aria-label={`Déplacer ${c.name}`}
                  title="Maintenir et glisser"
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", c.id);
                    setDragged(c.id);
                  }}
                  onDragEnd={() => setDragged(null)}
                >
                  <GripVertical size={18} aria-hidden="true" />
                </button>
                <span>
                  {categoryIcon(c.icon)} {c.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="ui-icon-button"
                  aria-label={`Monter ${c.name}`}
                  disabled={pending || index === 0}
                  onClick={() => void move(c.id, index - 1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className="ui-icon-button"
                  aria-label={`Descendre ${c.name}`}
                  disabled={pending || index === rows.length - 1}
                  onClick={() => void move(c.id, index + 1)}
                >
                  <ArrowDown size={16} />
                </button>
                {c.baseCategory !== "autres" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ui-icon-button"
                      aria-label={`Modifier ${c.name}`}
                      title={`Modifier ${c.name}`}
                      disabled={pending}
                      onClick={() => setEditing(c)}
                    >
                      <Pencil size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="ui-icon-button text-red-500 hover:text-red-600 dark:hover:text-red-400"
                      aria-label={`Supprimer ${c.name}`}
                      title={`Supprimer ${c.name}`}
                      disabled={pending}
                      onClick={() => void remove(c)}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
