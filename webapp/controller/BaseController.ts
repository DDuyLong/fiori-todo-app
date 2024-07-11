/* eslint-disable linebreak-style */
import Controller from "sap/ui/core/mvc/Controller";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace fioritodoapp.controller
 */
export default abstract class BaseController extends Controller {
  public getOwnerComponent(): AppComponent {
    return super.getOwnerComponent() as AppComponent;
  }

  public getResourceBundle(): ResourceBundle {
    const oModel = this.getOwnerComponent().getModel("i18n") as ResourceModel;
    return oModel.getResourceBundle() as ResourceBundle;
  }

  public getModel(sName?: string): JSONModel {
    return this.getView()?.getModel(sName) as JSONModel;
  }

  public setModel(oModel: Model, sName?: string): BaseController {
    this.getView()?.setModel(oModel, sName);
    return this;
  }
}
