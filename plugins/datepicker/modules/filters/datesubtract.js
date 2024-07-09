/*\
title: $:/plugins/kixam/datepicker/modules/filters/datesubtract.js
type: application/javascript
module-type: filteroperator

Compute time difference between two dates.
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var moment = require("$:/plugins/kixam/moment/moment.js");

/*
Export our filter functions
*/

exports.datesubtract = function(source,operator,options) {
	var results = [],
		precision = operator.suffix || "", // years|months|weeks|days|hours|minutes|seconds
		parseDate = function(value) {
			if(!value) return new Date();
			else if($tw.utils.isDate(value) || /^[0-9]{17}$/.test(value.trim())) return $tw.utils.parseDate(value);
			else return new Date(Date.parse(value));
		},
		targetDate = parseDate(operator.operand),
		dateSubtract = function(inputDate) {
			var end = moment(inputDate),
				start = moment(targetDate),
				diff = end.diff(start, precision);
			
			return diff;
		};

	source(function(tiddler,title) {
		var val = parseDate(title);
		if(!isNaN(val)) val = dateSubtract(val);
		if(val !== null) results.push(String(val));
	});

	return results;
};

})();