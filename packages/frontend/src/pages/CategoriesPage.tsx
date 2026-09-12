import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { showToast } from "../components/Toast";

interface Category {
  id: string;
  name: string;
  color: string | null;
  userId: string;
}

export default function CategoriesPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#3B82F6");

  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const data = await api<Category[]>("/api/categories", { token });
      setCategories(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar categorías",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setSubmitting(true);

    try {
      await api("/api/categories", {
        method: "POST",
        token,
        body: {
          name: name.trim(),
          color,
        },
      });

      setName("");
      setColor("#3B82F6");

      showToast("Categoría creada", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al crear categoría",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color ?? "#3B82F6");
  };

  const handleSave = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await api(`/api/categories/${editingId}`, {
        method: "PATCH",
        token,
        body: {
          name: editName.trim(),
          color: editColor,
        },
      });

      setEditingId(null);

      showToast("Categoría actualizada", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al actualizar categoría",
        "error",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/api/categories/${id}`, {
        method: "DELETE",
        token,
      });

      showToast("Categoría eliminada", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al eliminar categoría",
        "error",
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Categorías</h1>
        <p className="text-sm text-gray-500">
          Organiza tus tareas mediante categorías
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-6 flex items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            Nombre
          </label>

          <input
            type="text"
            value={name}
            required
            placeholder="Nueva categoría..."
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Color
          </label>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-14 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No hay categorías aún
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              {editingId === category.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-9 border rounded cursor-pointer"
                  />

                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
                  />

                  <button
                    onClick={handleSave}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Guardar
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{
                      backgroundColor: category.color ?? "#9CA3AF",
                    }}
                  />

                  <div
                    className="flex-1 cursor-pointer"
                    onDoubleClick={() => startEdit(category)}
                  >
                    <span className="text-sm text-gray-900">
                      {category.name}
                    </span>

                    {category.color && (
                      <span className="ml-2 text-xs text-gray-400">
                        {category.color}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => startEdit(category)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-xs text-gray-300 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}