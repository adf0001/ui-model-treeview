
var ele_id = require("ele-id");
var element_attribute = require("element-attribute");

var { getNode } = require("./node.js");
var { getContainer, containerAttribute } = require("./container.js");

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

//module exports

module.exports = {
	getNodeClass,
	setNodeClass,
	getContainerClassNode,
	isContainerMultipleNodeClass,

	nodeClass,
};
