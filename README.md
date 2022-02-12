# ui-model-treeview
dom ui model for treeview

# Usage & Api
```javascript

var ui_model_treeview = require("ui-model-treeview");

document.getElementById('divResult3').innerHTML = '<div></div>';

var el = document.getElementById('divResult3').firstChild;

/*
.addChild(elParent, template, container)
	template:{ (html | contentHtml/content | name, toExpand, toExpandTemplate), childrenTemplate  }
		| name.
	container: set true if the 'elParent' is already a children container
*/
var elNode1 = ui_model_treeview.addChild(el, "aaa", true);	//add by 'name'

var elNode2 = ui_model_treeview.addChild(elNode1, "bbb");
ui_model_treeview.nodeToExpand(elNode2, true);		//create to-expand by default

var elNode3 = ui_model_treeview.addChild(elNode2,	//create by template
	{
		content: "<span class='tree-name'>ccc</span><span class='my-cls'>ddd</span>"
	}
);

/*
.nodePart(el, className, template, before)
	template: { (html | contentHtml/content | createByDefault) } 
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

done(!(
	//.getNode (el)		//get 'tree-node' from self or ancestor of an element
	ui_model_treeview.getNode(elMy1) === elNode3 &&
	ui_model_treeview.getNode(elNode3) === elNode3
));

```

# Convention

```
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

```
