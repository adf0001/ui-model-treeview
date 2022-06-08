
var { nodeClass, isContainerMultipleNodeClass } = require("./node-class.js");
var { getContainer } = require("./container.js");

//shortcut for "tree-selected"
var selectedState = function (el, boolValue, toOrFromContainer, multiple) { return nodeClass(el, "tree-selected", boolValue, toOrFromContainer, multiple); }
var getSelected = function (el, fromContainer) { return nodeClass(el, "tree-selected", void 0, fromContainer); }
var isMultipleSelected = function (el) { return isContainerMultipleNodeClass(el, "tree-selected"); }

/*
return an unselect element array, or null.
*/
var unselectInElement = function (el, include) {
	var elSelected = getSelected(el, true);
	if (!elSelected) return null;

	var a = null;
	if (elSelected instanceof Array) {	//multiple selection
		elSelected.forEach(v => {
			if (el.contains(v)) {
				if (include || v !== el) {
					selectedState(v, false, true, true);	//multiple==true
					(a || (a = [])).push(v);
				}
			}
		});
	}
	else {		//single selection
		if (el.contains(elSelected)) {
			if (include || elSelected !== el) {
				selectedState(elSelected, false, true, false);	//multiple==false
				(a || (a = [])).push(elSelected);
			}
		}
	}

	return a;
}

//shortcuts for container
var unselectAll = function (el) {
	var container = getContainer(el);
	if (!container) return 0;

	return unselectInElement(container, false);
}

//module exports

module.exports = {
	selectedState,
	getSelected,
	isMultipleSelected,

	unselectInElement,
	unselectAll,
};
