import { delay } from "@std/async";
import { type Result, Results } from "@y0n1/react-mvvm";
import type { ITodosService } from "./ITodosService.ts";
import type { ITodoApiModel } from "../../models/apis/ITodoApiModel.ts";

const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

const fakeRecords: ITodoApiModel[] = [
  {
    id: crypto.randomUUID(),
    text: "Buy milk",
    completed: false,
    createdAt: sevenDaysAgo,
  },
  {
    id: crypto.randomUUID(),
    text: "Buy bread",
    completed: true,
    createdAt: sevenDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: crypto.randomUUID(),
    text: "Buy eggs",
    completed: false,
    createdAt: sevenDaysAgo,
  },
];

export class TodosServiceLocal implements ITodosService {
  async list(): Promise<Result<ITodoApiModel[], Error>> {
    if (Math.random() > 0.5) {
      await delay(3000);
      return Results.Failure(new Error("Failed to list todos"));
    }
    await delay(3000);
    return Results.Success(fakeRecords);
  }

  async add(_todo: ITodoApiModel): Promise<Result<void, Error>> {
    if (Math.random() > 0.5) {
      await delay(3000);
      return Results.Failure(new Error("Failed to add todo"));
    }
    await delay(1000);
    fakeRecords.push(_todo);
    return Results.Success();
  }

  async remove(_id: string): Promise<Result<void, Error>> {
    if (Math.random() > 0.5) {
      await delay(3000);
      return Results.Failure(new Error("Failed to remove todo"));
    }
    await delay(1000);
    fakeRecords.splice(fakeRecords.findIndex((todo) => todo.id === _id), 1);
    return Results.Success();
  }

  async toggle(_id: string): Promise<Result<ITodoApiModel, Error>> {
    if (Math.random() > 0.5) {
      await delay(3000);
      return Results.Failure(new Error("Failed to toggle todo"));
    }
    const result = await this.find(_id);
    if (!result.ok) {
      return Results.Failure(result.error);
    }
    const todo = result.value!;
    todo.completed = !todo.completed;
    todo.updatedAt = new Date();
    fakeRecords[fakeRecords.findIndex((t) => t.id === _id)] = todo;
    await delay(2000);
    return Results.Success(todo);
  }

  async find(_id: string): Promise<Result<ITodoApiModel, Error>> {
    await delay(1000);
    const todo = fakeRecords.find((todo) => todo.id === _id);
    if (!todo) {
      return Results.Failure(new Error("Todo not found"));
    }
    return Results.Success(todo);
  }
}
