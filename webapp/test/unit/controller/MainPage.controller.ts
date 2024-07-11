/*global QUnit*/
import Controller from "fioritodoapp/controller/App.controller";

QUnit.module("Main Controller");

QUnit.test("I should test the Main controller", function (assert: Assert) {
	const oAppController = new Controller("Main");
	oAppController.onInit();
	assert.ok(oAppController);
});