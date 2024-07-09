/*\
title: $:/plugins/kixam/datepicker/modules/filters/earlierlater.js
type: application/javascript
module-type: filteroperator
Filter operators that select tiddlers with a specified date field that shows a value earlier or later than a given date, respectively.
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter functions
*/

exports.earlier = function(source,operator,options,later) {
	var results = [],
		fieldName = operator.suffix || "modified",
		parseDate = function(value) {
			if(!value) return new Date();
			else if($tw.utils.isDate(value) || /^[0-9]{17}$/.test(value.trim())) return $tw.utils.parseDate(value);
			else return new Date(Date.parse(value));
		},
		targetDate = parseDate(operator.operand),
		isWithin = function(fieldDate) {
			return (!isNaN(targetDate) && !isNaN(fieldDate) && (later ? fieldDate <= targetDate : fieldDate >= targetDate));
		};

	source(function(tiddler,title) {
		var val = null;
		if(fieldName === "title") val = title;
		else if(tiddler && tiddler.fields[fieldName]) val = tiddler.fields[fieldName];
		val = parseDate(val);
		if(!isNaN(val) && ((operator.prefix !== "!") ^ isWithin(val))) results.push(title);
	});

	return results;
};

exports.later = function(source,operator,options) {
	return exports.earlier(source,operator,options,true);
};

})();