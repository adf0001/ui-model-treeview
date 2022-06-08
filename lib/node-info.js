
var { getNode } = require("./node.js");

var INFO_NODE = 0;
var INFO_TYPE = 1;

//get a NodeInfo, that is, [elNode]/[elChildren,"children"]/[elContainer, "container"]
var getNodeInfo = function (el, onlyTreeNode) {
	if (!el) return null;

	//tree-node filter
	if (onlyTreeNode) {
		var ni = getNodeInfo(el);
		return (ni && !ni[INFO_TYPE]) ? ni : null;
	}

	if (el instanceof Array) return el;		//already a NodeInfo
	else if (typeof el === "string") el = document.getElementById(el);	//ensure an dom element

	if (el) {
		if (el.classList.contains("tree-container")) return [el, "container"];
		if (el.classList.contains("tree-children")) return [el, "children"];

		el = getNode(el);	//get the tree-node
	}

	if (!el) {
		console.log("invalid node");
		return null;
	}
	return [el];
}

//module exports

module.exports = {
	INFO_NODE,
	INFO_TYPE,

	getNodeInfo,
};
