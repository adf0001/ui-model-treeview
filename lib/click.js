
var dispatch_event_by_name = require("dispatch-event-by-name");

var { nodePart } = require("./part.js");

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

//module exports

module.exports = {
	clickPart,

	clickName,
	clickToExpand,
	clickContainer,
};
