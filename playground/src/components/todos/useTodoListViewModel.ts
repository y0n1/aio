import { useMemo, useState } from "react";
import { Todo } from "./models/Todo.ts";

export const useTodoListViewModel = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");

  const counts = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    return {
      total: todos.length,
      completed,
      remaining: todos.length - completed,
    };
  }, [todos]);

  const addTodo = () => {
    const value = draft.trim();
    if (!value) {
      return;
    }

    setTodos((current) => [
      ...current,
      new Todo(Date.now(), value, false),
    ]);
    setDraft("");
  };

  const toggleTodo = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? new Todo(todo.id, todo.text, !todo.completed) : todo
      ),
    );
  };

  const removeTodo = (id: number) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
  };

  return {
    todos,
    draft,
    counts,
    addTodo,
    toggleTodo,
    removeTodo,
    handleDraftChange,
  };
};
