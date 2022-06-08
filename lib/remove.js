
var { getNode } = require("./node.js");
var { getContainer } = require("./container.js");
var { getNodeInfo, INFO_NODE, INFO_TYPE } = require("./node-info.js");
var { nodeChildren, nodeToExpand } = require("./part.js");
var { selectedState, unselectInElement } = require("./selected.js");
var { setToExpandState } = require("./to-expand.js");

/*
remove node
	options:
		.onlyChildren
			set true to remove only the children, not the elNode itself;

		.removeEmptyChildren
			set true remove empty tree-children;

		.updateSelection
			true/false/any-others		//default
				remove the disppeared nodes from the selection;
			"shift"
				remove the disppeared nodes from the selection;
					and if any node is removed from the selection,
						add the next/previous/parent node to the selection;

return true if finished
*/
var removeNode = function (elNode, options) {
	if (elNode instanceof Array) {
		//for elNode array
		var anyReturn;
		elNode.forEach(v => { anyReturn = removeNode(v, options) || anyReturn; });
		return anyReturn;
	}

	//arguments
	var onlyChildren = options?.onlyChildren;
	var updateSelection = options?.updateSelection;

	var ni = getNodeInfo(elNode);
	if (!ni) return;
	if (ni[INFO_TYPE] && !onlyChildren) return;

	elNode = ni[INFO_NODE];

	//get dom parent element
	var elParent = onlyChildren ? (ni[INFO_TYPE] ? elNode : nodeChildren(elNode)) : elNode.parentNode;
	if (!elParent) return;

	//unselect
	var unselectList = unselectInElement(elNode, !onlyChildren), shiftList;
	if (unselectList && updateSelection === "shift") {
		shiftList = unselectList.map(v => {
			v = v.nextSibling || v.previousSibling || v.parentNode.parentNode;
			return v?.classList?.contains("tree-node") ? v : null;
		});
	}

	//remove
	if (onlyChildren) elParent.innerHTML = "";	//remove dom childrens
	else elParent.removeChild(elNode);	//remove single dom element

	//update parent empty children state
	if (elParent && !elParent.hasChildNodes() && elParent !== getContainer(elNode)) {
		elParent = getNode(elParent);
		if (!elParent) return true;	//the later in elNode array may be removed, and elParent may be null;

		if (nodeToExpand(elParent)) setToExpandState(elParent, "disable");

		if (options?.removeEmptyChildren) {
			//remove empty children
			var elChildren = nodeChildren(elParent);
			if (elChildren) elChildren.parentNode.removeChild(elChildren);
		}
	}

	if (updateSelection === "shift" && shiftList) {
		var container = getContainer(elParent);
		shiftList.forEach(v => {
			if (v && container.contains(v)) {
				selectedState(v, true, true);
			}
		});
	}
	return true;
}

var removeAllChildren = function (elNode, options) {
	options = options ? Object.create(options) : {};
	options.onlyChildren = true;

	return removeNode(elNode, options)
}

//module exports

module.exports = {
	removeNode,
	remove: removeNode,

	removeAllChildren,
	removeChildren: removeAllChildren,
};
