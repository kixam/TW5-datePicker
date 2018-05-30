#!/bin/bash
# this script will compile the pikaday library into a tw-plugin
# it is largely adapted from felixhayashi's TW5-Vis.js build.sh script

#####################################################################
# Script Configuration
#####################################################################

pluginPrefix="$:/plugins/kixam/datepicker"       # prefix for all tiddlers of this plugin
srcPath="Pikaday"                                # input path
srcjs="$srcPath/pikaday.js"                      # source javascript file name
targetPath="plugins/datepicker"                  # target path
targetjs="$targetPath/pikaday.js"                # target javascript file name
targetcss="$targetPath/tiddlers/pikaday.css.tid" # target css file name

#####################################################################
# Program
#####################################################################

#====================================================================
printf "Fetch upstream resources...\n"
#====================================================================

git submodule update --init --recursive --remote

#====================================================================
printf "Perform cleanup...\n"
#====================================================================

# clean up
rm -f "$targetjs" "$targetcss"

#====================================================================
printf "minify and copy styles...\n"
#====================================================================

# header
header=\
'title: '${pluginPrefix}/pikaday.css'
type: text/css
tags: $:/tags/Stylesheet'

# uglifyied content; redirect stdin so its not closed by npm command
body=$(uglifycss $srcPath/css/pikaday.css < /dev/null)

printf "%s\n\n%s" "$header" "$body" > $targetcss

#====================================================================
printf "uglify and copy scripts...\n"
#====================================================================

# header with macro
header=\
'/*\
title: '${pluginPrefix}/pikaday.js'
type: application/javascript
module-type: library

@preserve
\*/'

# remove root references to window object
while IFS='' read -r line || [[ -n $line ]]; do
  if [[ "$line" =~ ^.*hasEventListeners\ =\ !!window\.addEventListener,.*$ \
     || "$line" =~ ^.*document\ =\ window.document,.*$ \
     || "$line" =~ ^.*sto\ =\ window.setTimeout,.*$ ]]
  then
    printf "<line removed: %s>\n" "$line"
  elif [[ "$line" =~ ^(.*)hasEventListeners(.*)$ ]] ; then
    echo "${BASH_REMATCH[1]}!!window.addEventListener${BASH_REMATCH[2]}" >> "$targetjs"
  elif [[ "$line" =~ ^(.*)\ document\.(.*)$ ]] ; then
    echo "${BASH_REMATCH[1]} window.document.${BASH_REMATCH[2]}" >> "$targetjs"
  elif [[ "$line" =~ ^(.*)sto\((.*)$ ]] ; then
    echo "${BASH_REMATCH[1]}window.setTimeout(${BASH_REMATCH[2]}" >> "$targetjs"
  elif [[ "$line" =~ ^(.*)require\(\'moment(.*)$ ]] ; then
    echo "${BASH_REMATCH[1]}require('$:/plugins/kixam/moment/moment.js${BASH_REMATCH[2]}" >> "$targetjs"
  else
    echo "$line" >> "$targetjs"
  fi
done < "$srcjs"

# uglifyied content; redirect stdin so its not closed by npm command
body=$(uglifyjs $targetjs --comments < /dev/null)
#body=$(cat $targetjs) # uncomment for no compression

printf "%s\n\n%s\n" "$header" "$body" > "$targetjs"

#====================================================================
printf "update version information...\n"
#====================================================================

version="$(cd "$srcPath" && git describe --tags $(git rev-list --tags --max-count=1))"
printf "using Pikaday.js version $version\n"

expr="s/Pikaday version[^\"]*\"/Pikaday version $version\"/g"
sed -i -r -e "$expr" "$targetPath/plugin.info"

exit
