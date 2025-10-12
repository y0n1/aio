import { useChangeNotifier } from "@y0n1/react-mvvm";
import { TodoListView } from "./view/TodoListView.tsx";
import { TodoListViewModel } from "./TodoListViewModel.ts";
import { AddCommand } from "./commands/AddCommand.ts";
import { RemoveCommand } from "./commands/RemoveCommand.ts";
import { DraftChangeCommand } from "./commands/DraftChangeCommand.ts";
import { ToggleCommand } from "./commands/ToggleCommand.ts";

export const TodoListMvvm = (): React.ReactNode => {
  const vm = useChangeNotifier(
    TodoListViewModel,
    undefined,
    "Let's write todos!",
  );

  const addCmd = new AddCommand(vm);
  const removeCmd = new RemoveCommand(vm);
  const draftChangeCmd = new DraftChangeCommand(vm);
  const toggleCmd = new ToggleCommand(vm);

  return (
    <TodoListView
      counters={vm.counts}
      todos={vm.todos}
      onAdd={addCmd.execute}
      onRemove={removeCmd.execute}
      onToggle={toggleCmd.execute}
      draft={vm.draft}
      onDraftChange={draftChangeCmd.execute}
    />
  );
};
TodoListMvvm.displayName = "TodoListMvvm";
