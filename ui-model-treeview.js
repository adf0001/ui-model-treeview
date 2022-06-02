
// ui-model-treeview @ npm, dom ui model for treeview

/*
convention:
	a treeview is defined as

	lv2:	<div class='tree-container'>						//tree container at topmost, optional;
				...
	lv1:		<div class='tree-node'>							//tree node main element, required;

					//all sub items should be direct children of 'tree-node'

	lv2:			<span class='tree-to-expand'>...</span>		//expand/collapse command element, optional;
	lv2:			//<span class='tree-to-expand tree-to-collapse/tree-disable'>...</span>	//state

	lv2:			<span class='tree-name'>...</span>			//name element, optional;

	lv3:			...											//other user defined content;

					//the last sub item is 'tree-children'

	lv1:			<div class='tree-children'>...</div>		//required if a node contains children;
				</div>

	lv2:		<div class='tree-node tree-selected'>...</div>	//tree-node selected state, optional;

			</div>

	* lv1 - basic required;
	* lv2 - optional, with tool set in this lib;
	* lv3 - user defined;

	* the 'class' names are the required properties;
	* the element tags are in user's favour;
*/

var ele_id = require("ele-id");
var insert_adjacent_return = require("insert-adjacent-return");
var element_attribute = require("element-attribute");

var defaultChildrenTemplate = "<div class='tree-children'></div>";
var defaultToExpandTemplate = "<span class='tree-to-expand tree-disable'>.</span>";

var add_css_text = require("add-css-text");
add_css_text(require("./ui-model-treeview.css"));

//get 'tree-node' from self or ancestor of an element
var getNode = function (el) {
	if (typeof el === "string") el = document.getElementById(el);

	while (el && el.classList) {
		if (el.classList.contains('tree-node')) return el;
		el = el.parentNode;
	}
	return null;
}

function cacheContainerId(elArray, containerId) {
	if (elArray.length) elArray.forEach(v => v.setAttribute("tree-container-id", containerId));
}

//get 'tree-container'
var getContainer = function (el) {
	if (typeof el === "string") el = document.getElementById(el);

	var cl, container;
	var elList = [];		//cache container id in tree-children

	while (el && (cl = el.classList)) {
		if (cl.contains('tree-container')) {
			cacheContainerId(elList, ele_id(el));
			return el;
		}

		if (cl.contains('tree-children')) {
			if (container = el.getAttribute("tree-container-id")) {
				cacheContainerId(elList, container);
				return document.getElementById(container);
			}
			elList.push(el);
		}

		el = el.parentNode;
	}
	return null;
}

/*
get or set container attribute
	value
		if value is "undefined", get and return the value;
			if not exist, return null;
			else
				if json is true, return the json object;
				else return the string;
		if value is null, remove the attribute;
		in othercases, set the attribute value as a string, or a json string;
	json
		boolean type
*/
var containerAttribute = function (el, name, value, json) {
	var container = getContainer(el);
	if (!container) return;

	return element_attribute(container, name, value, json);
}

//get node class
var getNodeClass = function (el, className) {
	return getNode(el)?.classList?.contains(className);
}

/*
set node class
	toContainer==true && multiple==false:
		toggle the last, then save node eid to container attribute className+"-eid-last";
	toContainer==true && multiple==true:
		add/remove node eid to container attribute className+"-eid-list", as an array json string;
	
	value
		boolean type;
		when toContainer is true,
			set true to add to the container attribute;
			set false to remove from the container attribute;
*/
var setNodeClass = function (el, className, value, toContainer, multiple) {
	var elNode = getNode(el);
	if (!elNode) return;

	value ? elNode.classList.add(className) : elNode.classList.remove(className);

	if (!toContainer) return;

	var container = getContainer(el);
	if (!container) return;

	var v = element_attribute(container, className + "-eid-" + (multiple ? "list" : "last"), void 0, multiple);
	var eid = ele_id(elNode);
	var idx;

	if (multiple) {		//multiple eids
		if (value) {
			if (!v) v = [eid];
			else if (v.indexOf(eid) >= 0) return; 	//already in the array
			else v.push(eid);
		}
		else {
			if (v && (idx = v.indexOf(eid)) >= 0) v.splice(idx, 1);	//remove
			else return;	//already not in the array
		}

		if (v && v.length > 0) element_attribute(container, className + "-eid-list", v, true);
		else element_attribute(container, className + "-eid-list", null);		//remove
	}
	else {		//single eid
		if (value) {
			if (v && v !== eid) document.getElementById(v)?.classList?.remove(className);
			element_attribute(container, className + "-eid-last", eid);
		}
		else {
			if (v === eid) element_attribute(container, className + "-eid-last", null);	//remove
		}
	}
}

//get node or node-list from container attribute
var getContainerClassNode = function (el, className, multiple) {
	var container = getContainer(el);
	if (!container) return;

	if (typeof multiple === "undefined") {
		//check multiple by the existence of the attribute
		if (container.hasAttribute(className + "-eid-last")) multiple = false;
		else if (container.hasAttribute(className + "-eid-list")) multiple = true;
		else return;
	}

	var v = element_attribute(container, className + "-eid-" + (multiple ? "list" : "last"), void 0, multiple);
	if (!v) return;

	if (v instanceof Array) return v.map(v => document.getElementById(v));
	else return document.getElementById(v);
}

//shortcut for getNodeClass()/setNodeClass()/getContainerClassNode()
var nodeClass = function (el, className, boolValue, toOrFromContainer, multiple) {
	if (typeof boolValue === "undefined") {
		if (toOrFromContainer) return getContainerClassNode(el, className, multiple);
		else return getNodeClass(el, className);
	}
	else return setNodeClass(el, className, boolValue, toOrFromContainer, multiple);
}

//shortcut for "tree-selected"
var selectedState = function (el, boolValue, toOrFromContainer, multiple) { return nodeClass(el, "tree-selected", boolValue, toOrFromContainer, multiple); }
var getSelected = function (el, fromContainer, multiple) { return nodeClass(el, "tree-selected", void 0, fromContainer, multiple); }

/*
get the direct part element of a tree-node by class name, or create by template.

template: { (outerHtml | innerHtml/content | createByDefault) } | innerHtml | createByDefault===true
*/
var nodePart = function (el, className, template, before) {
	el = getNode(el);
	if (!el) return null;

	var selector = "#" + ele_id(el) + " > ." + className.replace(/^\.+/, "");
	var elPart = el.querySelector(selector);

	if (elPart && elPart.parentNode === el) return elPart;	//existed
	if (!template) return null;		//don't create

	//arguments
	if (typeof template === "boolean") template = { createByDefault: template };
	else if (typeof template === "string") template = { innerHtml: template };

	template.innerHtml = template.innerHtml || template.content;

	//build outerHtml
	if (!template.outerHtml) {
		if (typeof template.innerHtml !== "undefined") {
			template.outerHtml = "<span class='" + className + "'>" + template.innerHtml + "</span>";
		}
		else {
			//create by default
			if (className === "tree-children") template.outerHtml = defaultChildrenTemplate;
			else if (className === "tree-to-expand") template.outerHtml = defaultToExpandTemplate;
			else template.outerHtml = "<span class='" + className + "'>" + className + "</span>";
		}
	}

	//create
	if (className === "tree-children") {
		elPart = insert_adjacent_return.append(el, template.outerHtml);	//append to the last
	}
	else if (before) {
		elPart = insert_adjacent_return.prepend(el, template.outerHtml);
	}
	else {
		//before tree-children
		var elChildren = el.querySelector("#" + ele_id(el) + " > .tree-children");
		elPart = elChildren
			? insert_adjacent_return.prependOut(elChildren, template.outerHtml)
			: insert_adjacent_return.append(el, template.outerHtml);
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
template:{ (outHtml | innerHtml/content | name, toExpand, toExpandTemplate),
	childrenTemplate, insert } | name.
childrenContainer: set true if the 'elNode' is already a children container; ignored if `.insert` is true;
*/
var addNode = function (elNode, template, childrenContainer) {
	//arguments
	if (!template) template = {};
	else if (typeof template === "string") template = { name: template };

	template.innerHtml = template.innerHtml || template.content;

	//build outHtml
	if (!template.outHtml) {
		var a = [];
		a[a.length] = "<div class='tree-node'>";
		if (template.innerHtml) {
			a[a.length] = template.innerHtml;
		}
		else {
			if (template.toExpand) a[a.length] = template.toExpandTemplate || defaultToExpandTemplate;
			a[a.length] = "<span class='tree-name'>" + (template.name || "item") + "</span>";
		}
		a[a.length] = "</div>";
		template.outHtml = a.join("");
	}

	var el;
	if (template.insert) {
		el = insert_adjacent_return.prependOut(getNode(elNode), template.outHtml);
	}
	else {
		//prepare children
		var elChildren = childrenContainer
			? elNode
			: nodePart(elNode, "tree-children", template.childrenTemplate || true);

		//add
		el = insert_adjacent_return.append(elChildren, template.outHtml);
	}
	if (!el.classList.contains("tree-node")) el.classList.add("tree-node");
	return el;
}

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
	var elToExpand = nodePart(el, "tree-to-expand", defaultToExpandTemplate, true);

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
	if (!elChildren) return;

	if (typeof updateChildren === "undefined") updateChildren = true;

	if (typeof updateChildren === "string") elChildren.style.display = updateChildren;
	else if (updateChildren && !curDisable) elChildren.style.display = state ? "none" : "";

	return elToExpand;
}

//get a NodeInfo, that is, [elNode]/[elChildren,"children"]/[elContainer, "container"]
var getNodeInfo = function (el, onlyTreeNode) {
	if (!el) return null;

	//tree-node filter
	if (onlyTreeNode) {
		var ni = this.getNodeInfo(el);
		return (ni && !ni[1]) ? ni : null;
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
	defaultChildrenTemplate,
	defaultToExpandTemplate,

	getNode,

	nodePart,

	nodeChildren,
	nodeName,
	nodeToExpand,

	addNode,

	getToExpandState,
	setToExpandState,

	getContainer,

	containerAttribute,
	containerAttr: containerAttribute,

	getNodeClass,
	setNodeClass,
	getContainerClassNode,

	nodeClass,

	selectedState,
	getSelected,

	getNodeInfo,

};
