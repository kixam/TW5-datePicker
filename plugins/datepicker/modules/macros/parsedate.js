/*\
title: $:/plugins/kixam/datepicker/modules/macros/parsedate.js
type: application/javascript
module-type: macro

<<parsedate text [format]>>

Parses a date from <text> (default: 'now') and reformats it using WikiText date format <format> (default: 'YYYY-0MM-0DD')

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */

"use strict";

exports.name = "parsedate";
exports.params = [
	{name: "text", default: "now"},
	{name: "format", default: "YYYY-0MM-0DD"}
];

exports.run = function(text,format) {
	var d;
	if(text === "now") d = new Date(); // explicit "now"
	else if(/^[0-9]{17}$/.test(text.trim())) d = $tw.utils.parseDate(text); // try to parse TW5 date format
	else d = new Date(Date.parse(text)); // try to parse date using native format
	// if(isNaN(d)) d = moment(text).toDate(); // try wild guess by moment.js
	if(isNaN(d)) return "<span class='tc-error' title='cannot parse date from " + (text ? '"'+text+'"' : "empty text") + "'>???</span>";
	else return $tw.utils.formatDateString(d, format);
};

})();
