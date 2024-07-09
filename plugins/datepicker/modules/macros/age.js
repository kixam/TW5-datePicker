/*\
title: $:/plugins/kixam/datepicker/modules/macros/age.js
type: application/javascript
module-type: macro

Compute a person age based on his/her birthdate

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "age";
exports.params = [
	{name: "birthdate", default: ""}
];

exports.run = function(birthdate) {
	var now = new Date(),
		ref = new Date(birthdate);
	return Math.floor((now - ref) / (1000*60*60*24*365));
};

})();