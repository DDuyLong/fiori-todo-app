import Device from "sap/ui/Device";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ListBinding from "sap/ui/model/ListBinding";
import FilterType from "sap/ui/model/FilterType";
import List from "sap/m/List";
import Dialog from "sap/m/Dialog";
import { Button$PressEvent } from "sap/m/Button";
import { SearchField$ChangeEvent } from "sap/m/SearchField";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

/**
 * @namespace fioritodoapp.controller
 */
export default class App extends BaseController {
  private dialog: Dialog;

  searchFilters: Filter[];
  tabFilters: Filter[];
  searchQuery: string;
  filterKey: "active" | "completed" | "all";

  public onInit(): void {
    this.searchFilters = [];
    this.tabFilters = [];

    this.setModel(
      new JSONModel({
        isMobile: Device.browser.mobile,
        filterText: undefined,
      }),
      "view"
    );
  }

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
    model.setProperty("/todoClone", todos);
    model.setProperty("/newTodo", "");
  }

  public clearCompleted(): void {
    const model = this.getModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const todos: Todo[] = model
      .getProperty("/todos")
      .map((todo: Todo) => Object.assign({}, todo));
    let i = todos.length;
    while (i--) {
      const todo = todos[i];
      if (todo.completed) {
        todos.splice(i, 1);
      }
    }

    model.setProperty("/todos", todos);
  }

  public updateItemsLeftCount(): void {
    const model = this.getModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const todos: Todo[] = model.getProperty("/todos") || [];

    const itemsLeft = todos.filter((todo: Todo) => !todo.completed).length;

    model.setProperty("/itemsLeftCount", itemsLeft);
  }

  public onSearch(event: SearchField$ChangeEvent) {
    const model = this.getModel();
    const input = event.getSource();

    this.searchFilters = [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.searchQuery = input.getValue();
    if (this.searchQuery && this.searchQuery.length > 0) {
      model.setProperty("/itemsRemovable", false);
      const filter = new Filter(
        "title",
        FilterOperator.Contains,
        this.searchQuery
      );
      this.searchFilters.push(filter);
    } else {
      model.setProperty("/itemsRemovable", true);
    }
    this._applyListFilters();
  }

  public onFilter(event: any) {
    const model = this.getModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const todos: Todo[] = model.getProperty("/todos");
    this.tabFilters = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.filterKey = event?.getParameter("item")?.getKey();
    switch (this.filterKey) {
      case "active":
        model.setProperty("/todoClone", todos);
        model.setProperty(
          "/todoClone",
          todos.filter((e) => e.completed === false)
        );
        break;
      case "completed":
        model.setProperty("/todoClone", todos);
        model.setProperty(
          "/todoClone",
          todos.filter((e) => e.completed === true)
        );
        break;
      case "all":
        model.setProperty("/todoClone", todos);
      default:
    }

    this._applyListFilters();
  }

  public _applyListFilters(): void {
    const list = this.byId("todoList") as List;
    const binding = list.getBinding("items") as ListBinding;

    binding.filter(
      this.searchFilters.concat(this.tabFilters),
      "todos" as FilterType
    );

    let i18nKey;
    if (this.filterKey && this.filterKey !== "all") {
      if (this.filterKey === "active") {
        i18nKey = "ACTIVE_ITEMS";
      } else {
        i18nKey = "COMPLETED_ITEMS";
      }
      if (this.searchQuery) {
        i18nKey += "_CONTAINING";
      }
    } else if (this.searchQuery) {
      i18nKey = "ITEMS_CONTAINING";
    }

    let filterText;
    if (i18nKey) {
      const resourceModel = this.getView()?.getModel("i18n") as ResourceModel;
      const resourceBundle =
        resourceModel.getResourceBundle() as ResourceBundle;
      filterText = resourceBundle.getText(i18nKey, [this.searchQuery]);
    }

    this.getModel("view").setProperty("/filterText", filterText);
  }

  public async onOpenDailog(e: Button$PressEvent): Promise<void> {
    const model = this.getModel();
    this.dialog ??= await (<Promise<Dialog>>this.loadFragment({
      name: "fioritodoapp.view.DeleteItemDialog",
    }));
    this.dialog.open();
    const todo = e.getSource()?.getBindingContext()?.getObject() as Todo;
    console.log(todo);

    model.setProperty("/deleteTodo", todo);
  }

  public onCloseDialog(): void {
    (<Dialog>this.byId("deleteItemDialog"))?.close();
  }

  public onDeleteItem(): void {
    const model = this.getModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const todos: Todo[] = model
      .getProperty("/todos")
      .map((todo: Todo) => Object.assign({}, todo));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const todo = model.getProperty("/deleteTodo");
    const newTodos = todos.filter((e) => e.id !== todo.id);
    model.setProperty("/todos", newTodos);
    (<Dialog>this.byId("deleteItemDialog"))?.close();
  }
}
