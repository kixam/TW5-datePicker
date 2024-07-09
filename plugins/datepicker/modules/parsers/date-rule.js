/*\
title: $:/plugins/kixam/datepicker/modules/parsers/wikiparser/rules/date.js
type: application/javascript
module-type: wikirule

Wiki text inline rule for ISO dates

```
Replace ISO date by a link to a tiddler with ISO date as its title, and displays full date as the text of the link
Triggered by date in ISO format, e.g. 2022-05-10
If prefixed with ~, the format will not be changed
Also does similar processing on months, e.g. 2022-05
```

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "date";
exports.types = {inline: true};

exports.init = function(parser) {
	this.parser = parser;
	// Regexp to match
	this.matchRegExp = new RegExp($tw.config.textPrimitives.unWikiLink + "?[1-2][0-9]{3}-[0-1][0-9](-[0-3][0-9])?","mg");
};

exports.parse = function() {
	// Get the details of the match
	var linkText = this.match[0];
	// move past the match
	this.parser.pos = this.matchRegExp.lastIndex;
	// If the date starts with the unwikilink character then just output it as is
	if(linkText.substr(0,1) === $tw.config.textPrimitives.unWikiLink)
		return [{type: "text", text: linkText.substr(1)}];

	var isDate = (this.match[1] !== undefined), // if false, we found a month
		rawDate = new Date(Date.parse(linkText + (isDate ? "" : "-01"))),
		formatDate = $tw.wiki.getTiddlerText("$:/config/plugins/kixam/FullDateFormat") || "DDD DDth MMM YYYY",
		formatMonth = $tw.wiki.getTiddlerText("$:/config/plugins/kixam/FullMonthFormat") || "MMM YYYY",
		fullDate = $tw.utils.formatDateString(rawDate, (isDate ? formatDate : formatMonth));

	// if not a valid date, just leave the text as it is
	if(isNaN(rawDate))
		return [{type: "text", text: linkText}];

	// return a link to a journal tiddler (existing or not), with full month or date as text
	return [{
		type: "link",
		attributes: {to: {type: "string", value: linkText}},
		children: [{type: "text", text: fullDate}]
	}];
};

})();
