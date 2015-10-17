/*\
title: $:/plugins/kixam/datepicker/widget.datepicker.js
type: application/javascript
module-type: widget

  A widget for displaying date pickers using Yet Another DatePicker at http://freqdec.github.io/datePicker/

  For full help see $:/plugins/kixam/datepicker/usage

  TODO: use HTML5 "date" (and not "datetime-local") input types if available
  TODO: set field type/flag to "date" to make TW5 render {{!!ourField}} as expected, i.e. like it renders e.g. {{!!created}}
  TODO: use our widget for system date fields (created, modified, ...)
\*/

/*jslint node: true, browser: true */
/*global $tw: false */

(function() {
  'use strict';

  var Widget = require("$:/core/modules/widgets/widget.js").widget;
  var moment = require("$:/plugins/kixam/moment/moment.js");
  var pikaday = require("$:/plugins/kixam/datepicker/pikaday.js"); // this is a modified version of pikaday.js, see build.sh

  var DatePickerWidget = function(parseTreeNode, options) {
    Widget.call(this);
    this.initialise(parseTreeNode, options);
  };

  DatePickerWidget.prototype = new Widget();

  DatePickerWidget.prototype.render = function(parent,nextSibling) {
    this.computeAttributes();
    this.renderChildren(parent,nextSibling);
    this.execute();
    this.parentDomNode = parent;

    // Choose the appropriate edit widget
    this.editor = $tw.utils.domMaker("input", {type: "date"});
    this.editorType = this.editor.type;
    parent.insertBefore(this.editor, nextSibling);
    this.domNodes.push(this.editor);

    this.onPickerDateSelect = this.onPickerDateSelect.bind(this);

    var langprefix = "$:/languages/".length,
        lang = $tw.wiki.getTiddlerText("$:/language").substring(langprefix, langprefix + 2);
    if(lang === "zh") {
      // TW5 does not use standard codes for Chinese
      var suffix = $tw.wiki.getTiddlerText("$:/language");
      suffix = suffix.substring(suffix.length-1);
      if(suffix === "s") {
        lang = "zh-cn"; //simplified
      } else {
        lang = "zh-tw"; //traditional
      }
    }

    var locale = moment.localeData(moment.locale([lang, "en"])),
        i18n = {
          previousMonth : "Previous Month",
          nextMonth     : "Next Month",
          months        : locale._months,
          monthsShort   : locale._monthsShort,
          weekdays      : locale._weekdays,
          weekdaysShort : locale._weekdaysShort,
        };

    this.picker = new pikaday({
      field: this.editor,
      format: this.editFormat,
      onSelect: this.onPickerDateSelect,
      i18n: i18n,
    });

    this.refreshSelf();
  };

  DatePickerWidget.prototype.execute = function() {
    // Get our parameters
    this.editFormat = this.getAttribute("format", "YYYY-MM-DD");
    this.saveFormat = this.getAttribute("fieldFormat", "YYYYMMDDHHmmssSSS");
    this.editTitle = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
    this.editField = this.getAttribute("field","created");
    this.editIndex = this.getAttribute("index");
    this.editClass = this.getAttribute("class");
    this.editPlaceholder = this.getAttribute("placeholder");
  };

  // Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
  DatePickerWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    // Refresh if an attribute has changed, or the type associated with the target tiddler has changed
    if(changedAttributes.tiddler || changedAttributes.field || changedAttributes.index || changedTiddlers[this.editTitle]) {
      this.refreshSelf();
      return true;
    } else {
      return this.refreshChildren(changedTiddlers);
    }
  };

  DatePickerWidget.prototype.refreshSelf = function() {
    var val = moment(this.getEditInfo().value, this.saveFormat);
    if(val.isValid()) {
      this.editor.value = val.format(this.editFormat);
      this.picker.setMoment(val, true);
    }
  }

  DatePickerWidget.prototype.onPickerDateSelect = function() {
    this.saveChanges(this.picker.toString(this.saveFormat));
  };

// ---------------------------------------------------------- //
// --- inspired from $:/core/modules/widgets/edit-text.js --- //
// ---------------------------------------------------------- //

  DatePickerWidget.prototype.saveChanges = function(text) {
    var editInfo = this.getEditInfo();
    if(text !== editInfo.value) {
        editInfo.update(text);
    }
  };

  DatePickerWidget.prototype.getEditInfo = function() {
    // Get the edit value
    var self = this,
        value,
        update;
    if(this.editIndex) {
        value = this.wiki.extractTiddlerDataItem(this.editTitle,this.editIndex,this.editDefault);
        update = function(value) {
            var data = self.wiki.getTiddlerData(self.editTitle,{});
            if(data[self.editIndex] !== value) {
                data[self.editIndex] = value;
                self.wiki.setTiddlerData(self.editTitle,data);
            }
        };
    } else {
        // Get the current tiddler and the field name
        var tiddler = this.wiki.getTiddler(this.editTitle);
        if(tiddler) {
            // If we've got a tiddler, the value to display is the field string value
            value = tiddler.getFieldString(this.editField);
        } else {
            // Otherwise, we need to construct a default value for the editor
            switch(this.editField) {
                case "text":
                    value = "Type the text for the tiddler '" + this.editTitle + "'";
                    break;
                case "title":
                    value = this.editTitle;
                    break;
                default:
                    value = "";
                    break;
            }
            if(this.editDefault !== undefined) {
                value = this.editDefault;
            }
        }
        update = function(value) {
            var tiddler = self.wiki.getTiddler(self.editTitle),
                updateFields = {
                    title: self.editTitle
                };
            updateFields[self.editField] = value;
            self.wiki.addTiddler(new $tw.Tiddler(self.wiki.getCreationFields(),tiddler,updateFields,self.wiki.getModificationFields()));
        };
    }
    return {value: value, update: update};
  };

// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

  exports["edit-date"] = DatePickerWidget;
}
());
