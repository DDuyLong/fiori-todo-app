/* eslint-disable linebreak-style */
import BaseController from "./BaseController";
type Todo = {
    id: number;
    title: string;
    completed: boolean;
  };
export default class InputController extends BaseController {

    public addTodo(): void {
        const model = this.getModel();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const todos: Todo[] = model
          .getProperty("/todos")
          .map((todo: Todo) => Object.assign({}, todo));
        todos.push({
          id: todos.length + 1,
          title: model.getProperty("/newTodo"),
          completed: false,
        });
    
        model.setProperty("/todos", todos);
        model.setProperty("/newTodo", "");
      }
}
