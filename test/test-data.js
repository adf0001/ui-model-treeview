
//global variable, for html page, refer tpsvr @ npm.
ui_model_treeview = require("../ui-model-treeview.js");

module.exports = {

	"ui_model_treeview": function (done) {
		if (typeof window === "undefined") throw "disable for nodejs";

		document.getElementById('divResult3').innerHTML =
			'<span class="-ht-cmd" id="cmdEnable">enable</span> ' +
			'<span class="-ht-cmd" id="cmdClick">click</span> ' +
			'<label><input id=chkMultiple type=checkbox>multiple</label> ' +
			'<label><input id=chkToggleSelection type=checkbox>toggle selection</label> ' +
			'<select id=selUpdateSel>' +
			'	<optgroup  label="update select"></optgroup>' +
			'	<option value="false">false</option>' +
			'	<option value="true">true/remove</option>' +
			'	<option value="shift">shift</option>' +
			'</select> ' +
			'<span class="-ht-cmd" id="cmdClearSelect">clear selection</span> ' +
			'<span class="-ht-cmd" id="cmdRemove">remove</span> ' +
			'<span id="spMsg"></span> ' +
			'<div class="tree-container" id="tree1"></div>';

		var el = document.getElementById('tree1');

		/*
		.addNode(elNode, options, childrenContainer)
			options:{ (outHtml | innerHtml/content | name, toExpand, toExpandTemplate),
				childrenTemplate, insert } | name.
			childrenContainer: set true if the 'elNode' is already a children container; ignored if `.insert` is true;
		
		shortcuts:
			.add(elNode, options, childrenContainer)

			.insertNode(elNode, options, toNext)
			.insert(elNode, options, toNext)

			.insertNodeToNext(elNode, options)
			.insertNext(elNode, options)
		*/
		var elNode1 = ui_model_treeview.addNode(el, "aaa", true);	//add by 'name'

		var elNode2 = ui_model_treeview.addNode(elNode1, "bbb");
		ui_model_treeview.nodeToExpand(elNode2, true);		//create to-expand by default

		var elNode3 = ui_model_treeview.addNode(elNode2,	//create by template
			{
				content: "<span class='tree-name'>ccc</span><span class='my-cls'>ddd</span>"
			}
		);

		var elNode4 = ui_model_treeview.insert(elNode3,	//by template.insertAt
			{
				content: "<span class='tree-name'>eeee</span><span class='my-cls'>fff</span>",
			}
		);
		var elNode4b = ui_model_treeview.insertNext(elNode3,
			{
				content: "<span class='tree-name'>by insert next</span>",
			}
		);
		var elNode4c = ui_model_treeview.insertNext(elNode3,
			{
				content: "<span class='tree-name'>by insert next 2</span>",
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

		el.addEventListener("click", function () {
			setTimeout(() => {
				document.getElementById("spMsg").textContent = el.getAttribute("tree-selected-eid-data");

			}, 0);	//delay for linsten sequence
		});

		function setOnClick() {
			var updateSel = document.getElementById("selUpdateSel").value;
			if (updateSel === "true") updateSel = true;
			else if (updateSel === "false") updateSel = false;
			//alert(updateSel);

			/*
			.listenOnClick(el, options)		//listen click event by setting container.onclick.
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
			ui_model_treeview.listenOnClick(el, {
				multipleSelection: document.getElementById("chkMultiple").checked,
				updateSelection: updateSel,
				toggleSelection: document.getElementById("chkToggleSelection").checked,
				notifyClick: true,
			});

		}
		setOnClick();

		document.getElementById("chkMultiple").onclick = setOnClick;
		document.getElementById("selUpdateSel").onchange = setOnClick;
		document.getElementById("chkToggleSelection").onclick = setOnClick;

		document.getElementById("cmdEnable").onclick = function () {
			/*
			.setToExpandState(el, state, text, updateChildren)		//set state of 'tree-to-expand'.

				state:
					bool, or string "toggle" or "disable"

				updateChildren:
					update children part flag; default true;
						true	- set css style 'display' to 'none' or '', when state is bool-value;
						false	- do not touch 'tree-children';
						"none"/""/string	- set css style 'display' value;
				
				return the to-expand element;

			.getToExpandState(el)		//return null/true/false/"disable"
			*/
			ui_model_treeview.setToExpandState(elNode2, "toggle");
		}

		document.getElementById("cmdRemove").onclick = function () {

			var updateSel = document.getElementById("selUpdateSel").value;
			if (updateSel === "true") updateSel = true;
			else if (updateSel === "false") updateSel = false;

			var sel = ui_model_treeview.getSelected(el, true);

			ui_model_treeview.removeNode(sel, {
				updateSelection: updateSel
			});

			ui_model_treeview.clickContainer(el);
		}

		document.getElementById("cmdClick").onclick = function () {
			//.clickPart(el, className, delay)
			ui_model_treeview.clickToExpand(elNode2);
		}

		document.getElementById("cmdClearSelect").onclick = function () {
			/*
			.unselectInElement(el, include)		//return unselect count

			shortcuts:
				.unselectAll(el)
			*/
			ui_model_treeview.unselectAll(el);
			ui_model_treeview.clickContainer(el);
		}

		//.containerAttribute(el, name, value, json)		//get or set container attribute
		ui_model_treeview.containerAttr(elMy2, "check", 999);

		/*
		.setNodeClass(el, className, value [, toContainer [, multiple ]] )	//set node class
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
		ui_model_treeview.setNodeClass(elMy2, "my-class", true, true);
		ui_model_treeview.setNodeClass(elMy2, "my-class2", true, true, true);

		/*
		//shortcut for getNodeClass()/setNodeClass()/getContainerClassNode()
		.nodeClass(el, className, boolValue, toOrFromContainer, multiple)

		shortcuts:
			//shortcut for "tree-selected"
			.selectedState(el, boolValue, toOrFromContainer, multiple)
			.getSelected(el, fromContainer)
		*/
		ui_model_treeview.selectedState(elMy2, true, true);
		//ui_model_treeview.selectedState(elMy2, true, true, true);

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

		var { INFO_NODE, INFO_TYPE } = ui_model_treeview;

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

			ui_model_treeview.getSelected(elMy2) === true &&
			ui_model_treeview.getSelected(elMy2, true) === elNode3 &&

			nf1[INFO_NODE] === elNode3 &&
			!nf1[INFO_TYPE] &&
			nf1b[INFO_NODE] === elNode3 &&
			!nf1b[INFO_TYPE] &&
			nf1 === nf1c &&

			nf2[INFO_NODE] === elNode2Children &&
			nf2[INFO_TYPE] === "children" &&
			nf2b === null &&

			nf3[INFO_NODE] === el &&
			nf3[INFO_TYPE] === "container" &&
			nf3b === null &&

			true
		));
	},

	"check exports": function (done) {
		for (var i in ui_model_treeview) {
			if (typeof ui_model_treeview[i] === "undefined") {
				done("undefined: " + i);
				return;
			}
		}
		done(false);
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('ui_model_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
