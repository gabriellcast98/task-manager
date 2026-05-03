import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_LABELS = {
  pending: "Pendiente",
  in_progress: "En progreso",
  done: "Finalizada",
};

const initialForm = {
  title: "",
  description: "",
  status: "pending",
};

const TASKS_PER_PAGE = 5;

const getTodayLocalDate = () => new Date().toLocaleDateString("en-CA");

const formatDateTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date(value));
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(getTodayLocalDate());
  const [page, setPage] = useState(1);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const filteredTasks = tasks.filter((task) => {
    const term = search.trim().toLowerCase();
    const taskDate = new Date(task.created_at).toLocaleDateString("en-CA");
    const matchesText =
      !term ||
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesDate = !dateFilter || taskDate === dateFilter;

    return matchesText && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const visibleTasks = filteredTasks.slice(
    (page - 1) * TASKS_PER_PAGE,
    page * TASKS_PER_PAGE
  );

  const loadTasks = async () => {
    const response = await fetch(`${API_URL}/tasks`);
    const result = await response.json();
    if (result.success) setTasks(result.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const url = editingId ? `${API_URL}/tasks/${editingId}` : `${API_URL}/tasks`;
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "No se pudo guardar la tarea");
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    loadTasks();
  };

  const editTask = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    setTaskToDelete(null);
    loadTasks();
  };

  const changeStatus = async (task, status) => {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter(getTodayLocalDate());
  };

  return (
    <main className="app">
      <div className="header">
        <div>
          <h1>Gestor de Tareas</h1>
          <p>Gabriel TC</p>
        </div>
        <span className="counter">{tasks.length}</span>
      </div>

      <section className="layout">
        <form className="task-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Editar tarea" : "Agregar tarea"}</h2>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Titulo"
          />
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Descripcion"
            rows="3"
          />
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="done">Finalizada</option>
          </select>
          {error && <div className="error">{error}</div>}
          <div className="actions">
            <button type="submit">{editingId ? "Guardar" : "Crear tarea"}</button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="tasks-panel panel">
          <div className="filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo o descripcion"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="done">Finalizada</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
            <button type="button" className="secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>

          <div className="task-list">
            {tasks.length === 0 && (
              <p className="empty">No hay tareas todavia.</p>
            )}

            {tasks.length > 0 && filteredTasks.length === 0 && (
              <p className="empty">No hay tareas con esos filtros.</p>
            )}

            {visibleTasks.map((task) => (
              <article key={task.id} className="task-card">
                <div className="task-content">
                  <div className="task-top">
                    <h2>{task.title}</h2>
                    <span className={`badge ${task.status}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-dates">
                    <span>Creada: {formatDateTime(task.created_at)}</span>
                    <span>Editada: {formatDateTime(task.updated_at)}</span>
                  </div>
                </div>

                <div className="task-controls">
                  <select
                    value={task.status}
                    onChange={(event) => changeStatus(task, event.target.value)}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="done">Finalizada</option>
                  </select>
                  <button className="secondary" onClick={() => editTask(task)}>
                    Editar
                  </button>
                  <button className="danger" onClick={() => setTaskToDelete(task)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredTasks.length > TASKS_PER_PAGE && (
            <div className="pagination">
              <button
                className="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>
                Pagina {page} de {totalPages}
              </span>
              <button
                className="secondary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </section>

      {taskToDelete && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Eliminar tarea</h2>
            <p>¿Esta seguro que desea eliminar la Tarea?</p>
            <p className="modal-warning">Esta decision no se puede revertir.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setTaskToDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => deleteTask(taskToDelete.id)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
