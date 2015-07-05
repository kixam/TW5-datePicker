#!/bin/bash
# this script will compile the vis library into a tw-plugin
# it is largely adapted from felixhayashi's TW5-Vis.js build.sh script

#####################################################################
# Script Configuration
#####################################################################

pluginPrefix="$:/plugins/kixam/datepicker" # prefix for all tiddlers of this plugin
distPath="temp"                            # output path
srcPath="Pikaday"                          # input path
targetPath="."                             # target path
targetjs="pikaday.js"                      # target javascript file name

#####################################################################
# Program
#####################################################################

#====================================================================
printf "Perform cleanup...\n"
#====================================================================

# clean up
[ -d $distPath ] && rm -rf $distPath

# create paths
mkdir -p $distPath
mkdir $distPath/tiddlers

#====================================================================
printf "minify and copy styles...\n"
#====================================================================

# header
header=\
'title: '${pluginPrefix}/pikaday.css'
type: text/vnd.tiddlywiki
tags: $:/tags/Stylesheet'

# uglifyied content; redirect stdin so its not closed by npm command
body=$(uglifycss $srcPath/css/pikaday.css < /dev/null)

printf "%s\n\n%s" "$header" "$body" > $distPath/tiddlers/pikaday.css.tid

#====================================================================
printf "uglify and copy scripts...\n"
#====================================================================

# header with macro
header=\
'/*\
title: '${pluginPrefix}/$targetjs'
type: application/javascript
module-type: library

@preserve
\*/'

# remove root references to window object
while IFS='' read -r line || [[ -n $line ]]; do
  if [[ "$line" =~ ^.*hasEventListeners\ =\ !!window\.addEventListener,.*$  \
     || "$line" =~ ^.*document\ =\ window.document,.*$ \
     || "$line" =~ ^.*sto\ =\ window.setTimeout,.*$ ]]
  then
    printf "<line removed: %s>\n" "$line"
  elif [[ "$line" =~ ^(.*)hasEventListeners(.*)$ ]] ; then
    echo "${BASH_REMATCH[1]}!!window.addEventListener${BASH_REMATCH[2]}" >> $distPath/$targetjs
  elif [[ "$line" =~ ^(.*)\ document\.(.*)$ ]] ; then
    echo "${BASH_REMATCH[1]} window.document.${BASH_REMATCH[2]}" >> $distPath/$targetjs
  elif [[ "$line" =~ ^(.*)sto\((.*)$ ]] ; then
    echo "${BASH_REMATCH[1]}window.setTimeout(${BASH_REMATCH[2]}" >> $distPath/$targetjs
  else
    echo "$line" >> $distPath/$targetjs
  fi
done < $srcPath/$targetjs

# uglifyied content; redirect stdin so its not closed by npm command
body=$(uglifyjs $distPath/$targetjs --comments < /dev/null)
#body=$(cat $distPath/$targetjs) # uncomment for no compression

printf "%s\n\n%s\n" "$header" "$body" > $distPath/$targetjs

#====================================================================
printf "copy to final directory...\n"
#====================================================================

cp -r $distPath/tiddlers/* $targetPath/tiddlers/
cp -r $distPath/*.js $targetPath/

exit
