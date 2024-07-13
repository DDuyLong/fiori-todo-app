import BaseController from "./BaseController";
type Todo = {
    id: number;
    title: string;
    completed: boolean;
  };
export default class InputController extends BaseController {

    public addTodo(): void {
        const model =  this.getModel();
        const todos: Todo[] = (<Todo[]>model
          .getProperty("/todos"))
          .map((todo: Todo) => Object.assign({}, todo));
        todos.push({
          id: todos.length + 1,
          title: <string>model.getProperty("/newTodo"),
          completed: false
        });
    
        model.setProperty("/todos", todos);
        model.setProperty("/newTodo", "");
      }
}
