
//get 'tree-node' from self or ancestor of an element
var getNode = function (el) {
	if (typeof el === "string") el = document.getElementById(el);

	while (el?.classList) {
		if (el.classList.contains('tree-node')) return el;
		el = el.parentNode;
	}
	return null;
}

//module exports

module.exports = {
	getNode,
};
