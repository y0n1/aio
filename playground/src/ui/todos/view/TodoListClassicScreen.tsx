import { useMemo, useState } from "react";
import { Todo } from "../../../models/domain/Todo.ts";
import { TodoListView } from "./TodoListView.tsx";

export const TodoListClassicScreen = (): React.ReactNode => {
  const [todos, setTodos] = useState<Todo[]>([]); // What if these need to be loaded from a server?
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
      new Todo(crypto.randomUUID(), value, false),
    ]);
    setDraft("");
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? new Todo(todo.id, todo.text, !todo.completed) : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  const draftChange = (value: string) => {
    setDraft(value);
  };

  const vm = {
    todos,
    draft,
    counts,
    addTodo,
    toggleTodo,
    removeTodo,
    draftChange,
  };

  return (
    <TodoListView
      counters={vm.counts}
      draft={vm.draft}
      onDraftChange={vm.draftChange}
      todos={vm.todos}
      onAddTodo={vm.addTodo}
      onToggleTodo={vm.toggleTodo}
      onRemoveTodo={vm.removeTodo}
    />
  );
};
TodoListClassicScreen.displayName = "TodoListClassicScreen";

// const useTodoListViewModel = () => {
//   const [todos, setTodos] = useState<Todo[]>([]); // What if these need to be loaded from a server?
//   const [draft, setDraft] = useState("");

//   const counts = useMemo(() => {
//     const completed = todos.filter((todo) => todo.completed).length;
//     return {
//       total: todos.length,
//       completed,
//       remaining: todos.length - completed,
//     };
//   }, [todos]);

//   const addTodo = () => {
//     const value = draft.trim();
//     if (!value) {
//       return;
//     }

//     setTodos((current) => [
//       ...current,
//       new Todo(crypto.randomUUID(), value, false),
//     ]);
//     setDraft("");
//   };

//   const toggleTodo = (id: string) => {
//     setTodos((current) =>
//       current.map((todo) =>
//         todo.id === id ? new Todo(todo.id, todo.text, !todo.completed) : todo
//       )
//     );
//   };

//   const removeTodo = (id: string) => {
//     setTodos((current) => current.filter((todo) => todo.id !== id));
//   };

//   const draftChange = (value: string) => {
//     setDraft(value);
//   };

//   return {
//     todos,
//     draft,
//     counts,
//     addTodo,
//     toggleTodo,
//     removeTodo,
//     draftChange,
//   };
// };
