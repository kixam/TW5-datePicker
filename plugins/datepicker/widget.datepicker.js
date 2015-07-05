/*\
title: $:/plugins/kixam/datepicker/widget.datepicker.js
type: application/javascript
module-type: widget

  A widget for displaying date pickers using Yet Another DatePicker at http://freqdec.github.io/datePicker/

  For full help see $:/plugins/kixam/datepicker/usage

\*/

/*jslint node: true, browser: true */
/*global $tw: false */

(function() {
  'use strict';

  var Widget = require("$:/core/modules/widgets/widget.js").widget;
  var utils = require("$:/plugins/kixam/datepicker/widget.utils.js");
  var moment = require("$:/plugins/kixam/moment/moment.js");
  if(typeof window !== 'undefined' && typeof window.moment !== 'function') {
    window.moment = moment;
  }
  var pikaday = require("$:/plugins/kixam/datepicker/pikaday.js");

  var DatePickerWidget = function(parseTreeNode,options) {
    Widget.call(this);
    this.initialise(parseTreeNode,options);
  };

  DatePickerWidget.prototype = new Widget();

  DatePickerWidget.prototype.render = function(parent,nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.tiddler = $tw.wiki.getTiddler(this.getVariable("currentTiddler"));

    var attrParseWorked = this.execute();
    if (attrParseWorked === undefined) {
      this.holder = $tw.utils.domMaker("input", {type: "text", id:"test", attributes:{style: "position: relative;"}});
      parent.insertBefore(this.holder,nextSibling);
      this.domNodes.push(this.holder);
      this.picker = new pikaday({ field: this.holder });

    } else {
      utils.dispError(this.parseTreeNode.type+": Unexpected attribute(s) "+attrParseWorked.join(", "));
      this.refresh = function() {}; // disable refresh of this as it won't work with incorrect attributes
    }
  };

  DatePickerWidget.prototype.execute = function() {
    var attrParseWorked = utils.parseWidgetAttributes(this, {
           tiddler:{ type: "string", defaultValue: undefined},
           field:  { type: "string", defaultValue: "created"},
           format: { type: "string", defaultValue: undefined},
           });

    if ((attrParseWorked === undefined) && (this.filter)) {
      this.compiledFilter = this.wiki.compileFilter(this.filter);
    }

    return attrParseWorked;
  };

  /*
     Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
  DatePickerWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(changedAttributes.tiddler
    || changedAttributes.format
    || changedAttributes.field) {
      this.refreshSelf();
      return true;
    }
  };

  exports.datepicker = DatePickerWidget;

  }
  ());
