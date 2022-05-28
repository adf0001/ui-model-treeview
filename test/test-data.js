
//global variable, for html page, refer tpsvr @ npm.
ui_model_treeview = require("../ui-model-treeview.js");

module.exports = {

	"ui_model_treeview": function (done) {
		if (typeof window === "undefined") throw "disable for nodejs";

		document.getElementById('divResult3').innerHTML = '<div class="tree-container"></div>';

		var el = document.getElementById('divResult3').firstChild;

		/*
		.addNode(elNode, template, container)
			template:{ (outHtml | innerHtml/content | name, toExpand, toExpandTemplate),
				childrenTemplate, insert } | name.
			container: set true if the 'elNode' is already a children container; ignored if `.insert` is true;
		*/
		var elNode1 = ui_model_treeview.addNode(el, "aaa", true);	//add by 'name'

		var elNode2 = ui_model_treeview.addNode(elNode1, "bbb");
		ui_model_treeview.nodeToExpand(elNode2, true);		//create to-expand by default

		var elNode3 = ui_model_treeview.addNode(elNode2,	//create by template
			{
				content: "<span class='tree-name'>ccc</span><span class='my-cls'>ddd</span>"
			}
		);

		var elNode4 = ui_model_treeview.addNode(elNode3,	//by template.insertAt
			{
				content: "<span class='tree-name'>eeee</span><span class='my-cls'>fff</span>",
				insert: true,
			}
		);

		/*
		.nodePart(el, className, template, before)
			template: { (outerHtml | innerHtml/content | createByDefault) } 
				| content | createByDefault===true

			shortcuts:
				.nodeChildren(el, template)
				.nodeName(el, template)
				.nodeToExpand(el, template, before)
		*/
		var elMy1 = ui_model_treeview.nodePart(elNode3, "my-cls");
		var elMy2 = ui_model_treeview.nodePart(elNode3, "my-cls2", true);	//create part if not exist, by default

		el.onclick = function (evt) {
			var target = evt.target;

			if (target.classList.contains("tree-to-expand")) {

				/*
				.setToExpandState(el, state, text)		//set state of 'tree-to-expand', but do not touch 'tree-children'.
					state: bool, or string "toggle" or "disable"
				*/
				ui_model_treeview.setToExpandState(target, "toggle");

				//.getToExpandState(el)		//return null/true/false/"disable"
				var state = ui_model_treeview.getToExpandState(target);
				target.style.background = state ? "lime" : "yellow";
			}
		};

		//.containerAttribute(el, name [, value])		//get or set container attribute
		ui_model_treeview.containerAttr(elMy2, "check", 999);

		/*
		.nodeClass(el, className [, boolValue])		//get or set node class state

			shortcuts:
				.selectState(el, boolValue)
		*/
		ui_model_treeview.nodeClass(elMy2, "my-class", true);
		ui_model_treeview.selectState(elMy2, true);

		done(!(
			//.getNode (el)		//get 'tree-node' from self or ancestor of an element
			ui_model_treeview.getNode(elMy1) === elNode3 &&
			ui_model_treeview.getNode(elNode3) === elNode3 &&
			ui_model_treeview.getContainer(elNode3) === el &&

			ui_model_treeview.containerAttr(elMy2, "check") == 999 &&
			ui_model_treeview.containerAttr(elMy2, "check") !== 999 &&
			ui_model_treeview.containerAttr(elMy2, "check") === "999" &&

			ui_model_treeview.selectState(elMy2) === true &&
			ui_model_treeview.nodeClass(elMy2, "my-class") === true

		));
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('ui_model_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
