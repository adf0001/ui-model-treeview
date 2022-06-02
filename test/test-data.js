
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

		ui_model_treeview.addNode(elNode3,
			{
				name: "<b>bbb</b>",
			}
		);
		ui_model_treeview.addNode(elNode3,
			{
				name: "not work",
				nameHtml: "<b>bbb2</b>",
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
				//target.style.background = state ? "lime" : "yellow";
			}
		};

		//.containerAttribute(el, name [, value])		//get or set container attribute
		ui_model_treeview.containerAttr(elMy2, "check", 999);

		/*
		.setNodeClass(el, className, value [, toContainer [, multiple ]] )
		*/
		ui_model_treeview.setNodeClass(elMy2, "my-class", true, true);
		ui_model_treeview.setNodeClass(elMy2, "my-class2", true, true, true);

		/*
		//shortcut for getNodeClass()/setNodeClass()/getContainerClassNode()
		.nodeClass(el, className, boolValue, toOrFromContainer, multiple)

		shortcuts:
			//shortcut for "tree-selected"
			.selectedState(el, boolValue, toOrFromContainer, multiple)
			.getSelected(el, fromContainer, multiple)
		*/
		ui_model_treeview.selectedState(elMy2, true, true);
		ui_model_treeview.selectedState(elMy2, true, true, true);

		//.getNodeInfo(elNode, onlyTreeNode)
		//get a NodeInfo, that is, [elNode]/[elChildren,"children"]/[elContainer, "container"]
		var nf1 = ui_model_treeview.getNodeInfo(elMy2);
		var nf1b = ui_model_treeview.getNodeInfo(elMy2, true);
		var nf1c = ui_model_treeview.getNodeInfo(nf1, true);

		var elNode2Children = ui_model_treeview.nodeChildren(elNode2);	//a children part
		var nf2 = ui_model_treeview.getNodeInfo(elNode2Children);
		var nf2b = ui_model_treeview.getNodeInfo(elNode2Children, true);

		var nf3 = ui_model_treeview.getNodeInfo(el);	//the container
		var nf3b = ui_model_treeview.getNodeInfo(el, true);

		done(!(
			//.getNode (el)		//get 'tree-node' from self or ancestor of an element
			ui_model_treeview.getNode(elMy1) === elNode3 &&
			ui_model_treeview.getNode(elNode3) === elNode3 &&
			ui_model_treeview.getContainer(elNode3) === el &&

			ui_model_treeview.containerAttr(elMy2, "check") == 999 &&
			ui_model_treeview.containerAttr(elMy2, "check") !== 999 &&
			ui_model_treeview.containerAttr(elMy2, "check") === "999" &&

			ui_model_treeview.nodeClass(elMy2, "my-class") === true &&
			ui_model_treeview.nodeClass(elMy2, "my-class", void 0, true) === elNode3 &&
			ui_model_treeview.nodeClass(elMy2, "my-class2", void 0, true, true)[0] === elNode3 &&

			ui_model_treeview.selectedState(elMy2) === true &&
			ui_model_treeview.selectedState(elMy2, void 0, true) === elNode3 &&
			ui_model_treeview.selectedState(elMy2, void 0, true, true)[0] === elNode3 &&

			ui_model_treeview.getSelected(elMy2) === true &&
			ui_model_treeview.getSelected(elMy2, true) === elNode3 &&
			ui_model_treeview.getSelected(elMy2, true, true)[0] === elNode3 &&

			nf1[0] === elNode3 &&
			!nf1[1] &&
			nf1b[0] === elNode3 &&
			!nf1b[1] &&
			nf1 === nf1c &&

			nf2[0] === elNode2Children &&
			nf2[1] === "children" &&
			nf2b === null &&

			nf3[0] === el &&
			nf3[1] === "container" &&
			nf3b === null &&

			true
		));
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('ui_model_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
