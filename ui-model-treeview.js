
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

	lv4:			...											//other user defined content;

					//the last sub item is 'tree-children'

	lv1:			<div class='tree-children'>...</div>		//required if a node contains children;
				</div>

	lv2:		<div class='tree-node tree-selected'>...</div>	//tree-node selected state, optional;

			</div>

	* lv1 - basic required;
	* lv2 - optional, with tool set in this lib;
	* lv3 - optional, editing tools in this lib;
	* lv4 - user defined;

	* the 'class' names are the required properties;
	* the element tags are in user's favour;
*/

//module exports

module.exports = require("./level-3.js");
