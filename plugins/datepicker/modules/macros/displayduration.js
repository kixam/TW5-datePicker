/*\
title: $:/plugins/kixam/datepicker/modules/macros/displayduration.js
type: application/javascript
module-type: macro

<<displayduration text>>

Displays the duration in hours from <text>

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */

"use strict";

exports.name = "displayduration";
exports.params = [
	{name: "text"},
	{name: "precision", default: "d"}
];

exports.run = function(text, precision) {
	var duration = parseFloat(text),
		days = (precision === "d" ? Math.floor(duration/24) : 0),
		hours = (precision !== "m" ? Math.floor(duration - days*24) : 0),
		minutes = Math.floor((duration - days*24 - hours) * 60);
	if(!duration) return "-";
	else return (days ? days + "j" : "")
		+ (days && (hours || minutes) ? ", " : "")
		+ (hours ? hours + "h" : "")
		+ (minutes && days ? ", " : "")
		+ (minutes && !days && minutes <= 9 ? "0" : "")
		+ (minutes ? minutes + "'" : "");
};
})();