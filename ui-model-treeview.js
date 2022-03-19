
// ui-model-treeview @ npm, dom ui model for treeview

/*
convention:
	a treeview is defined as

	lv1:	<div class='tree-node'>							//tree node main element, required;

				//all sub items should be direct children of 'tree-node'

	lv2:		<span class='tree-to-expand'>...</span>		//expand/collapse command element, optional;
	lv2:		//<span class='tree-to-expand tree-to-collapse/tree-disable'>...</span>	//state

	lv2:		<span class='tree-name'>...</span>			//name element, optional;

	lv3:		...											//other user defined content;

				//the last sub item is 'tree-children'

	lv1:		<div class='tree-children'>...</div>		//required if a node contains children;
			</div>

	* lv1 - basic required;
	* lv2 - optional, with tool set in this lib;
	* lv3 - user defined;

	* the 'class' names are the required properties;
	* the element tags are in user's favour;
*/

var ele_id = require("ele-id");
var insert_adjacent_return = require("insert-adjacent-return");

var defaultChildrenTemplate = "<div class='tree-children' style='padding-left:1em;'></div>";
var defaultToExpandTemplate = "<span class='tree-to-expand' style='padding:0em 0.5em;text-decoration:none;font-family:monospace;'>+</span>";

//get 'tree-node' from self or ancestor of an element
var getNode = function (el) {
	if (typeof el === "string") el = document.getElementById(el);

	while (el && el.classList) {
		if (el.classList.contains('tree-node')) return el;
		el = el.parentNode;
	}
	return null;
}

/*
get the direct part element of a tree-node by class name, or create by template.

template: { (html | contentHtml/content | createByDefault) } | content | createByDefault===true
*/
var nodePart = function (el, className, template, before) {
	el = getNode(el);

	var selector = "#" + ele_id(el) + " > ." + className.replace(/^\.+/, "");
	var elPart = el.querySelector(selector);

	if (elPart && elPart.parentNode === el) return elPart;	//existed
	if (!template) return null;		//don't create

	//arguments
	if (typeof template === "boolean") template = { createByDefault: template };
	else if (typeof template === "string") template = { contentHtml: template };

	if (!("contentHtml" in template) && ("content" in template)) template.contentHtml = template.content;

	//build html
	if (!template.html) {
		if (typeof template.contentHtml !== "undefined") {
			template.html = "<span class='" + className + "'>" + template.contentHtml + "</span>";
		}
		else {
			//create by default
			if (className === "tree-children") template.html = defaultChildrenTemplate;
			else if (className === "tree-to-expand") template.html = defaultToExpandTemplate;
			else template.html = "<span class='" + className + "'>" + className + "</span>";
		}
	}

	//create
	if (className === "tree-children") {
		elPart = insert_adjacent_return.append(el, template.html);	//append to the last
	}
	else if (before) {
		elPart = insert_adjacent_return.prepend(el, template.html);
	}
	else {
		//before tree-children
		var elChildren = el.querySelector("#" + ele_id(el) + " > .tree-children");
		elPart = elChildren
			? insert_adjacent_return.prependOut(elChildren, template.html)
			: insert_adjacent_return.append(el, template.html);
	}

	//ensure class name existed.
	if (!el.querySelector(selector)) elPart.classList.add(className);

	return elPart;
}

//shortcuts of .nodePart()
var nodeChildren = function (el, template) { return nodePart(el, "tree-children", template); }
var nodeName = function (el, template) { return nodePart(el, "tree-name", template); }
var nodeToExpand = function (el, template, before) {
	return nodePart(el, "tree-to-expand", template, (typeof before === "undefined") ? true : before);
}

/*
template:{ (html | contentHtml/content | name, toExpand, toExpandTemplate), childrenTemplate, insert } | name.
container: set true if the 'elNode' is already a children container; ignored if `.insert` is true;
*/
var addNode = function (elNode, template, container) {
	//arguments
	if (!template) template = {};
	else if (typeof template === "string") template = { name: template };

	if (!("contentHtml" in template) && ("content" in template)) template.contentHtml = template.content;

	//build html
	if (!template.html) {
		var a = [];
		a[a.length] = "<div class='tree-node'>";
		if (template.contentHtml) {
			a[a.length] = template.contentHtml;
		}
		else {
			if (template.toExpand) a[a.length] = template.toExpandTemplate || defaultToExpandTemplate;
			a[a.length] = "<span class='tree-name'>" + (template.name || "item") + "</span>";
		}
		a[a.length] = "</div>";
		template.html = a.join("");
	}

	var el;
	if (template.insert) {
		el = insert_adjacent_return.prependOut(getNode(elNode), template.html);
	}
	else {
		//prepare children
		var elChildren = container
			? elNode
			: nodePart(elNode, "tree-children", template.childrenTemplate || true);

		//add
		el = insert_adjacent_return.append(elChildren, template.html);
	}
	if (!el.classList.contains("tree-node")) el.classList.add("tree-node");
	return el;
}

//return null/true/false/"disable"
var getToExpandState = function (el) {
	var elExpand = nodeToExpand(el);
	if (!elExpand) return null;

	if (elExpand.classList.contains("tree-disable")) return "disable";
	if (elExpand.classList.contains("tree-to-collapse")) return false;
	return true;
}

//set state of 'tree-to-expand', but do not touch 'tree-children'.
//state: bool, or string "toggle" or "disable"
var setToExpandState = function (el, state, text) {
	//get or create
	var elExpand = nodePart(el, "tree-to-expand", defaultToExpandTemplate, true);

	//get current state
	var disable = elExpand.classList.contains("tree-disable");
	var curState = !elExpand.classList.contains("tree-to-collapse");

	//disable
	if (state === "disable") {
		if (disable) return;
		elExpand.classList.add("tree-disable");
		elExpand.textContent = text || ".";
		return;
	}

	//enabled state

	if (disable) { elExpand.classList.remove("tree-disable"); }	//remove disable

	if (state === "toggle") state = !curState;

	if (state) {
		elExpand.classList.remove("tree-to-collapse");
		if (disable || state != curState) elExpand.textContent = text || "+";
	}
	else {
		elExpand.classList.add("tree-to-collapse");
		if (disable || state != curState) elExpand.textContent = text || "-";
	}
}

module.exports = {
	defaultChildrenTemplate: defaultChildrenTemplate,
	defaultToExpandTemplate: defaultToExpandTemplate,

	getNode: getNode,

	nodePart: nodePart,

	nodeChildren: nodeChildren,
	nodeName: nodeName,
	nodeToExpand: nodeToExpand,

	addNode: addNode,

	getToExpandState: getToExpandState,
	setToExpandState: setToExpandState,

};
