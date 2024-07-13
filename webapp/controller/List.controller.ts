import ResourceBundle from "sap/base/i18n/ResourceBundle";
import List from "sap/m/List";
import { SearchField$ChangeEvent } from "sap/m/SearchField";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterType from "sap/ui/model/FilterType";
import ListBinding from "sap/ui/model/ListBinding";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import BaseController from "./BaseController";
import Device from "sap/ui/Device";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Button$PressEvent } from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

enum FilterKey {
  Active = "active",
  Completed = "completed",
  All = "all",
}

export default class listController extends BaseController {

  private dialog: Dialog;

  searchFilters: Filter[];
  tabFilters: Filter[];
  searchQuery: string;
  filterKey: FilterKey;
  
  public onInit(): void {
    this.searchFilters = [];
    this.tabFilters = [];

    this.setModel(
      new JSONModel({
        isMobile: Device.browser.mobile,
        filterText: undefined
      }),
      "view"
    );
  }

  public clearCompleted(): void {
    const model: JSONModel = this.getModel();
    
    const todos: Todo[] =( <Todo[]>model
      .getProperty("/todos"))
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
    const todos: Todo[] = <Todo[]>model.getProperty("/todos") || [];

    const itemsLeft = todos.filter((todo: Todo) => !todo.completed).length;

    model.setProperty("/itemsLeftCount", itemsLeft);
  }

  public onSearch(event: SearchField$ChangeEvent) {
    const model = this.getModel();
    const input = event.getSource();

    this.searchFilters = [];
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

  public onFilter(event: SegmentedButton$SelectionChangeEvent) {
    this.tabFilters = [];
    this.filterKey = event.getParameter("item")?.getKey() as FilterKey;
    switch (this.filterKey) {
      case FilterKey.Active:
        this.tabFilters.push(new Filter("completed", FilterOperator.EQ, false));
        break;
      case FilterKey.Completed:
        this.tabFilters.push(new Filter("completed", FilterOperator.EQ, true));
        break;
      case FilterKey.All:
      default:
    }

    this._applyListFilters();
  }

  public _applyListFilters(): void {
    const list = this.byId("listTodo") as List;
    const binding = list.getBinding("items") as ListBinding;
    binding.filter(
      this.searchFilters.concat(this.tabFilters),
      "todos" as FilterType
    );

    let i18nKey;
    if (this.filterKey && this.filterKey !== FilterKey.All) {
      if (this.filterKey === FilterKey.Active) {
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
      name: "fioritodoapp.view.DeleteItemDialog"
    }));
    this.dialog.open();
    const todo = e.getSource()?.getBindingContext()?.getObject() as Todo;
    model.setProperty("/deleteTodo", todo);
  }

  public onCloseDialog(): void {
    (<Dialog>this.byId("deleteItemDialog"))?.close();
  }

  public onDeleteItem(): void {
    const model = this.getModel();
    const todos: Todo[] = (<Todo[]>model
      .getProperty("/todos"))
      .map((todo: Todo) => Object.assign({}, todo));
    const todo = <Todo>model.getProperty("/deleteTodo");
    const todoFilters = todos.filter((item) => item.id !== todo.id);
    model.setProperty("/todos", todoFilters);

    (<Dialog>this.byId("deleteItemDialog"))?.close();
  }
}
