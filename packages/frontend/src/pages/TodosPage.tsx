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

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  categoryId: string | null;
}

export default function TodosPage() {
  const { token } = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [filterCategory, setFilterCategory] = useState("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [todoData, categoryData] = await Promise.all([
        api<Todo[]>("/api/todo", { token }),
        api<Category[]>("/api/categories", { token }),
      ]);

      setTodos(todoData);
      setCategories(categoryData);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar",
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

    if (!title.trim()) return;

    setSubmitting(true);

    try {
      await api("/api/todo", {
        method: "POST",
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          categoryId: categoryId || undefined,
        },
        token,
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setCategoryId("");

      showToast("Tarea creada", "success");
      await load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al crear",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await api(`/api/todo/${todo.id}`, {
        method: "PATCH",
        body: {
          completed: !todo.completed,
        },
        token,
      });

      await load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al actualizar",
        "error",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/api/todo/${id}`, {
        method: "DELETE",
        token,
      });

      showToast("Tarea eliminada", "success");
      await load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al eliminar",
        "error",
      );
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? "");
    setEditDueDate(todo.dueDate ? todo.dueDate.split("T")[0] : "");
    setEditCategoryId(todo.categoryId ?? "");
  };

  const handleSave = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      await api(`/api/todo/${editingId}`, {
        method: "PATCH",
        body: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          dueDate: editDueDate || null,
          categoryId: editCategoryId || null,
        },
        token,
      });

      setEditingId(null);
      showToast("Tarea actualizada", "success");

      await load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al guardar",
        "error",
      );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getCategory = (id: string | null) => {
    if (!id) return undefined;
    return categories.find((category) => category.id === id);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filterCategory === "all") {
      return true;
    }

    if (filterCategory === "none") {
      return !todo.categoryId;
    }

    return todo.categoryId === filterCategory;
  });

  const completed = todos.filter((todo) => todo.completed).length;
  const total = todos.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Tareas
          </h1>

          <p className="text-sm text-gray-500">
            {completed} de {total} completadas
          </p>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-6 flex gap-3 items-end flex-wrap"
      >
        <div className="flex-1 min-w-48 flex flex-col gap-1">
          <input
            type="text"
            placeholder="Nueva tarea..."
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-48 flex flex-col gap-1">
          <input
            type="text"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-40 flex flex-col gap-1">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-44 flex flex-col gap-1">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin categoría</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Agregar
        </button>
      </form>

      <div className="mb-4 flex items-center gap-2">
        <label
          htmlFor="category-filter"
          className="text-sm text-gray-500"
        >
          Filtrar por categoría:
        </label>

        <select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="all">Todas</option>
          <option value="none">Sin categoría</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {filterCategory !== "all" && (
          <span className="text-xs text-gray-400">
            {filteredTodos.length} resultado(s)
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : filteredTodos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No hay tareas para este filtro
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {filteredTodos.map((todo) => {
            const category = getCategory(todo.categoryId);

            return (
              <div
                key={todo.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                {editingId === todo.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(e.target.value)
                      }
                      placeholder="Descripción (opcional)"
                      className="w-full px-2 py-1 border border-blue-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) =>
                        setEditDueDate(e.target.value)
                      }
                      className="w-full px-2 py-1 border border-blue-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                      value={editCategoryId}
                      onChange={(e) =>
                        setEditCategoryId(e.target.value)
                      }
                      className="w-full px-2 py-1 border border-blue-200 rounded text-xs bg-white text-gray-600"
                    >
                      <option value="">Sin categoría</option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Guardar
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-0.5 text-gray-400 text-xs hover:text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDoubleClick={() => startEdit(todo)}
                    className="flex-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm ${
                          todo.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {todo.title}
                      </span>

                      {category && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            borderColor:
                              category.color ?? "#9CA3AF",
                            color:
                              category.color ?? "#6B7280",
                            backgroundColor: `${category.color ?? "#9CA3AF"}18`,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                category.color ?? "#9CA3AF",
                            }}
                          />

                          {category.name}
                        </span>
                      )}

                      <svg
                        className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5">
                      {todo.description && (
                        <p className="text-xs text-gray-400">
                          {todo.description}
                        </p>
                      )}

                      {todo.dueDate && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            !todo.completed &&
                            new Date(todo.dueDate) < new Date()
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {formatDate(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-sm shrink-0"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}