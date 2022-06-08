
var dispatch_event_by_name = require("dispatch-event-by-name");

var { getContainer } = require("./container.js");
var { nodeName, nodeChildren } = require("./part.js");
var { getSelected, selectedState, unselectInElement, unselectAll } = require("./selected.js");
var { clickName, clickContainer } = require("./click.js");
var { getToExpandState, setToExpandState } = require("./to-expand.js");

/*
listen click event by setting container.onclick.
	options:
		.multipleSelection
			boolean type; multiple selection flag;

		.updateSelection
			false		//default
				don't touch selection; 
			true/"remove"
				remove the collapsed nodes from the selection;
			"shift"
				remove the collapsed nodes from the selection;
					and if any node is removed from the selection,
						add the node that casused collapsing to the selection;

		.toggleSelection
			boolean type; selection can be canceled by another click;
		
		.notifyClick
			set a click event to container after setting container.onclick;
*/
var listenOnClick = function (el, options) {
	var container = getContainer(el);
	if (!container) return;

	var multipleSelection = !!options?.multipleSelection;
	var updateSelection = options?.updateSelection;
	var toggleSelection = options?.toggleSelection;

	container.onclick = function (evt) {
		var elTarget = evt.target;

		if (elTarget.classList.contains("tree-to-expand")) {
			var state = getToExpandState(elTarget), elChildren;
			if (state === "disable") return;

			setToExpandState(elTarget, "toggle");
			state = !state;

			if (!state || !updateSelection ||
				!(elChildren = nodeChildren(elTarget)) || !elChildren.hasChildNodes()
			) return;

			var unselectList = unselectInElement(elChildren, false);

			if (unselectList && updateSelection === "shift") {
				selectedState(elTarget, false, true, multipleSelection);
				clickName(elTarget);	//may notify
			}
		}
		else {
			var elName = nodeName(elTarget);
			if (elName && elName.contains(elTarget)) {	//click on name or inside name
				selectedState(elTarget, toggleSelection ? !(getSelected(elTarget)) : true, true, multipleSelection);
			}
		}
	}

	//refresh selection
	var sel = getSelected(container, true);
	if (multipleSelection) {
		if (!sel || !(sel instanceof Array)) {
			selectedState(sel || container, sel, true, multipleSelection);
		}
	}
	else {
		if (sel instanceof Array) {
			sel = sel[sel.length - 1] || null;
			unselectAll(container);
			selectedState(sel || container, sel, true, multipleSelection);
		}
	}

	if (options?.notifyClick) clickContainer(container);
}

//module exports

module.exports = {
	listenOnClick,
};
