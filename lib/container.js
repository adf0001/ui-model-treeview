
var ele_id = require("ele-id");
var element_attribute = require("element-attribute");

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

//module exports

module.exports = {
	getContainer,
	
	containerAttribute,
	containerAttr: containerAttribute,
};
