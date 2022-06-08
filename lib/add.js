
var ele_id = require("ele-id");
var insert_adjacent_return = require("insert-adjacent-return");

var { getNode } = require("./node.js");
var { nodePart, DEFAULT_TO_EXPAND_TEMPLATE } = require("./part.js");

/*
options:{ (outHtml | innerHtml/content | name | nameHtml, toExpand, toExpandTemplate),
	childrenTemplate, insert } | name.
childrenContainer: set true if the 'elNode' is already a children container; ignored if `.insert` is true;
*/
var addNode = function (elNode, options, childrenContainer) {
	//arguments
	if (!options) options = {};
	else if (typeof options === "string") options = { name: options };

	options.innerHtml = options.innerHtml || options.content;

	//build outHtml
	if (!options.outHtml) {
		var a = [];
		a[a.length] = "<div class='tree-node'>";
		if (options.innerHtml) {
			a[a.length] = options.innerHtml;
		}
		else {
			if (options.toExpand) a[a.length] = options.toExpandTemplate || DEFAULT_TO_EXPAND_TEMPLATE;

			//fast nameHtml, not safe;
			a[a.length] = "<span class='tree-name'>" + (options.nameHtml || "item") + "</span>";
		}
		a[a.length] = "</div>";
		options.outHtml = a.join("");
	}

	var el;
	if (options.insert) {
		el = insert_adjacent_return.prependOut(getNode(elNode), options.outHtml);
	}
	else {
		//prepare children
		var elChildren = childrenContainer
			? elNode
			: nodePart(elNode, "tree-children", options.childrenTemplate || true);

		//add
		el = insert_adjacent_return.append(elChildren, options.outHtml);
	}
	if (!el.classList.contains("tree-node")) el.classList.add("tree-node");

	//set safe name
	if (options.name && !options.nameHtml) {
		var elName = el.querySelector("#" + ele_id(el) + " > .tree-name");
		if (elName) elName.textContent = options.name;
	}

	return el;
}

//module exports

module.exports = {
	addNode,
	add: addNode,
};
