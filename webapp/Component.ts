import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace fioritodoapp
 */
export default class Component extends BaseComponent {
  public static metadata = {
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
    manifest: "json",
  };

  /**
   * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
   * @public
   * @override
   */
  public init(): void {
    // call the base component's init function
    super.init();

    const data = {
      newTodo: "",
      todos: [
        {
          id: 1,
          title: "di chơi",
          completed: false,
        },
      ],
      deleteTodo: {
        id: 1,
        title: "di chơi",
        completed: false,
      },
      itemsRemovable: true,
      completedCount: 1,
      todoClone : [
        {
          id: 1,
          title: "di chơi",
          completed: false,
        },
      ]
    };

    const dataModel = new JSONModel(data);
    this.setModel(dataModel);

    // enable routing
    this.getRouter().initialize();

    // set the device model
    this.setModel(createDeviceModel(), "device");
  }
}
