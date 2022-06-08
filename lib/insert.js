
var { getNodeInfo, INFO_NODE } = require("./node-info.js");
var { addNode } = require("./add.js");

//shortcuts for .addNode()

var insertNode = function (elNode, options, toNext) {
	//node info
	var ni = getNodeInfo(elNode, true);	//only tree-node
	if (!ni) return null;

	elNode = ni[INFO_NODE];

	//arguments
	if (!options) options = { insert: true };
	else if (typeof options === "string") options = { name: options, insert: true };
	else {
		options = Object.create(options);
		options.insert = true;
	}

	if (toNext) {
		if (elNode.nextSibling) return addNode(elNode.nextSibling, options);
		else {
			options.insert = false;
			return addNode(elNode.parentNode, options);
		}
	}
	else return addNode(elNode, options);
}

var insertNodeToNext = function (elNode, options) { return insertNode(elNode, options, true); }

//module exports

module.exports = {
	insertNode,
	insert: insertNode,

	insertNodeToNext,
	insertNext: insertNodeToNext,
};
