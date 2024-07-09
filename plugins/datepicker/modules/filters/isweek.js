/*\
title: $:/plugins/kixam/datepicker/modules/filters/isweek.js
type: application/javascript
module-type: filteroperator

Filter operators that filter out inputs that are not dates or do not match given week number / week year, respectively.
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter functions
*/

exports.isweek = function(source,operator,options,isyear) {
	var results = [],
	fieldName = operator.suffix || "modified",
	parseDate = function(value) {
		if($tw.utils.isDate(value) || /^[0-9]{17}$/.test(value.trim())) return $tw.utils.parseDate(value);
		else return new Date(Date.parse(value));
	},
	target = parseInt(operator.operand),
	// week functions adapted from https://weeknumber.net/how-to/javascript
	// Returns the ISO week of the date.
	getWeek = function(ref) {
		var date = new Date(ref.getTime());
		date.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year.
		date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
		// January 4 is always in week 1.
		var week1 = new Date(date.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
	},
	// Returns the four-digit year corresponding to the ISO week of the date.
	getWeekYear = function(ref) {
		var date = new Date(ref.getTime());
		date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
		return date.getFullYear();
	},
	isWeek = function(fieldDate) {
		return (target === (isyear ? getWeekYear(fieldDate) : getWeek(fieldDate)));
	};

	source(function(tiddler,title) {
		if(tiddler
		&& !isNaN(parseDate(tiddler.fields[fieldName]))
		&& !isNaN(target)
		&& (isyear || (target > 0 && target <= 53))
		&& ((operator.prefix === "!") ^ isWeek(parseDate(tiddler.fields[fieldName])))) {
			results.push(title);
		}
	});

	return results;
};

exports.isweekyear = function(source,operator,options) {
	return exports.isweek(source,operator,options,true);
};

})();
