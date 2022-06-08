
var { nodePart, nodeToExpand, DEFAULT_TO_EXPAND_TEMPLATE } = require("./part.js");

//return null/true/false/"disable"
var getToExpandState = function (el) {
	var elToExpand = nodeToExpand(el);
	if (!elToExpand) return null;

	if (elToExpand.classList.contains("tree-disable")) return "disable";
	if (elToExpand.classList.contains("tree-to-collapse")) return false;
	return true;
}

/*
set state of 'tree-to-expand'.

	state:
		bool, or string "toggle" or "disable"

	updateChildren:
		update children part flag; default true;
			true	- set css style 'display' to 'none' or '', when state is bool-value;
			false	- do not touch 'tree-children';
			"none"/""/string	- set css style 'display' value;
	
	return the to-expand element;
*/
var setToExpandState = function (el, state, text, updateChildren) {
	//get or create
	var elToExpand = nodePart(el, "tree-to-expand", DEFAULT_TO_EXPAND_TEMPLATE, true);
	if (!elToExpand) return;

	//get current state
	var curState = !elToExpand.classList.contains("tree-to-collapse");
	var curDisable = elToExpand.classList.contains("tree-disable");

	//disable
	if (state === "disable") {
		if (!curDisable) {
			elToExpand.classList.add("tree-disable");
			elToExpand.textContent = text || ".";
			curDisable = true;
		}
	}
	else {
		//enabled state
		if (state === "toggle") state = !curState;

		if (state) elToExpand.classList.remove("tree-to-collapse");
		else elToExpand.classList.add("tree-to-collapse");

		if (curDisable || state != curState || text) elToExpand.textContent = text || (state ? "+" : "-");

		if (curDisable) {
			elToExpand.classList.remove("tree-disable");	//remove disable
			curDisable = false;
		}
	}

	//update children
	var elChildren = nodePart(el, "tree-children");
	if (!elChildren) return elToExpand;

	if (typeof updateChildren === "undefined") updateChildren = true;

	if (typeof updateChildren === "string") elChildren.style.display = updateChildren;
	else if (updateChildren && !curDisable) elChildren.style.display = state ? "none" : "";

	return elToExpand;
}

//module exports

module.exports = {
	getToExpandState,
	setToExpandState,
};
