/*\
title: $:/plugins/kixam/datepicker/modules/macros/lastmonthday.js
type: application/javascript
module-type: macro

<<lastmonthday yearmonth>>

Returns last day of given month on given year. Input should be formatted as YYYY-0DD. Defaults to "now".
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */

"use strict";

exports.name = "monthlastday";
exports.params = [
	{name: "yearmonth", default: "now"}
];

exports.run = function(yearmonth) {
	var now = ! /^[0-9]{4}-[0-9]{2}$/.test(yearmonth), // default to now if the format is not strictly as specified
		year = ( now ? (new Date()).getFullYear() : parseInt(yearmonth.substr(0,4)) ),
		month = ( now ? (new Date()).getMonth() : parseInt(yearmonth.substr(5))-1 ); // Date()'s month is [0-11]
	return (new Date(year,month+1,0)).getDate(); // day prior to next month; month+1=12 will give us 31 (no out of bounds error)
};

})();
