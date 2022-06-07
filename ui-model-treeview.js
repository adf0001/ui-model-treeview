
// ui-model-treeview @ npm, dom ui model for treeview

/*
convention:
	a treeview is defined as

	lv1:	<div class='tree-container'>						//tree container at topmost, required;
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
var dispatch_event_by_name = require("dispatch-event-by-name");

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

/*
get element of 'tree-container'
*/
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

//get or set container attribute, refer to element-attribute @ npm.
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
	toContainer
		false
			only set current node class, don't save data to container;
		true
			save node eid data to container attribute className+"-eid-data";

			if "multiple" is false
				if "value" is true, toggle the last;
				then save eid as a json string object, or null;
			if "multiple" is true
				save as eid array, or empty array;
			if "multiple" is `undefined`
				get current "multiple" from the data, then save;
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

	var v = element_attribute.getJson(container, className + "-eid-data");
	if (typeof multiple === "undefined") multiple = (v && (v instanceof Array));	//[...] or []

	var eid = ele_id(elNode);
	var idx, toSave;

	if (multiple) {		//multiple eids
		//transfer to array
		if (!v) {
			v = [];
			toSave = true;
		}
		else if (!(v instanceof Array)) {
			v = [v.toString()];
			toSave = true;
		}

		//save to container
		if (value) {
			if (v.indexOf(eid) < 0) v.push(eid);	//not in the array
			else if (!toSave) return;	//already in the array, check force save.
		}
		else {
			if ((idx = v.indexOf(eid)) >= 0) v.splice(idx, 1);	//remove
			else if (!toSave) return;	//already not in the array, check force save.
		}

		element_attribute.setJson(container, className + "-eid-data", v);
	}
	else {		//single eid
		//transfer to string or null
		if (typeof v !== "string" && v !== null) {
			if (v && (v instanceof Array) && v.length) {
				v = v[v.length - 1];	//transfer last one
				if (typeof v !== "string") v = null;
			}
			else v = null;

			toSave = true;
		}

		//save to container
		if (value) {
			if (v && v !== eid) document.getElementById(v)?.classList?.remove(className);	//toggle last
			element_attribute.setJson(container, className + "-eid-data", eid);
		}
		else {
			if (v === eid) element_attribute.remove(container, className + "-eid-data");
			else if (toSave) element_attribute.json(container, className + "-eid-data", v);
		}
	}
}

//get node or node-list from container attribute
var getContainerClassNode = function (el, className) {
	var v = containerAttribute(el, className + "-eid-data", void 0, true);
	if (!v) return;

	if (v instanceof Array) return v.map(v => document.getElementById(v));
	else return document.getElementById(v);
}

var isContainerMultipleNodeClass = function (el, className) {
	var v = containerAttribute(el, className + "-eid-data", void 0, true);
	return !!(v && (v instanceof Array));
}

//shortcut for getNodeClass()/setNodeClass()/getContainerClassNode()
var nodeClass = function (el, className, boolValue, toOrFromContainer, multiple) {
	if (typeof boolValue === "undefined") {
		if (toOrFromContainer) return getContainerClassNode(el, className);
		else return getNodeClass(el, className);
	}
	else return setNodeClass(el, className, boolValue, toOrFromContainer, multiple);
}

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

/*
get the direct part element of a tree-node by class name, or create by template.

template: { (outerHtml | innerHtml/content | createByDefault) } | innerHtml | createByDefault===true
*/
var nodePart = function (el, className, template, before) {
	if (className === "tree-container") return getContainer(el);	//shortcut for tree-container

	el = getNode(el);
	if (!el) return null;

	if (className === "tree-node") return el;	//shortcut for tree-node

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

//click part tool
var clickPart = function (el, className, delay) {
	el = nodePart(el, className);
	if (!el) return;

	dispatch_event_by_name.click(el, (typeof delay === "number") ? delay : (void 0));
}

//shortcuts of .clickPart()
var clickName = function (el, delay) { return clickPart(el, "tree-name", delay); }
var clickToExpand = function (el, delay) { return clickPart(el, "tree-to-expand", delay); }
var clickContainer = function (el, delay) { return clickPart(el, "tree-container", delay); }

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
			if (options.toExpand) a[a.length] = options.toExpandTemplate || defaultToExpandTemplate;

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

	if (updateSelection === "shift") {
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
	defaultChildrenTemplate,
	defaultToExpandTemplate,

	getNode,

	nodePart,

	nodeChildren,
	nodeName,
	nodeToExpand,

	addNode,

	insertNode,
	insertNodeToNext,

	add: addNode,
	insert: insertNode,
	insertNext: insertNodeToNext,

	getToExpandState,
	setToExpandState,

	getContainer,

	containerAttribute,
	containerAttr: containerAttribute,

	getNodeClass,
	setNodeClass,
	getContainerClassNode,
	isContainerMultipleNodeClass,

	nodeClass,

	selectedState,
	getSelected,
	isMultipleSelected,

	unselectInElement,
	unselectAll,

	INFO_NODE,
	INFO_TYPE,

	getNodeInfo,

	clickPart,

	clickName,
	clickToExpand,
	clickContainer,

	listenOnClick,

	removeNode,
	remove: removeNode,
	removeAllChildren,
	removeChildren: removeAllChildren,

};
