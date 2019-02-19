# YU Kaltura Media Package
"YU Kaltura Media Package" is a third-party's Kaltura plugin package for Moodle 2.9 or later. This package is developed by the Media and Information Technology Center, Yamaguchi University. By using this package, users can upload media to the Kaltura server, and easily embed the media in Moodle courses. Moreover, this package provides some useful functions. Since this package does not require Kaltura Application Framework (KAF), can work with Kaltura Community Edition (CE) and other editions.

In order to use this package, administrators must install "[YU Kaltura Media Local Libraries](https://moodle.org/plugins/local_yukaltura)" and "[YU Kaltura Media Gallery](https://moodle.org/plugins/local_yumymedia)".
These plugins provide functions such as uploading, playing back and deleting media files to users.

In addition, the administrators can install "[YU Kaltura Media Assignment](https://moodle.org/plugins/mod_kalmediaassign)" and "[YU Kaltura Media Resource](https://moodle.org/plugins/mod_kalmediares)".
These plugins provide teachers ability of creating resource and activity modules which use kaltura media in their Moodle courses.

Please note that there is a chance this module will not work on some Moodle environment. Also, this package is only available in English. Stay tuned to future versions for other language supports.

Original plugin package ("Kaltura Video Package") has better functions than ours and is easy to use. So that, for customers of the "Kaltura SaaS Edition", use the original plugin package is the better.

YU Kaltura Media Gallery for Moodle
------

This plugin provides media gallery (called "My Media") for users. Through the "My Media", users can upload media files, record a movie using web-camera, preview and delete their medias, and edit metadata of each media. Also, users can set enable/disable access restriction to their own media. Moreover, user can record a video by using PC's web-camera, and can upload the video to Kaltura server.
This plugin is updated with stable releases. To follow active development on GitHub, click [here](https://github.com/YU-MITC/moodle-local_yumymedia/).

Requirements
------

* PHP5.3 or greater.
* Web browsers must support the JavaScript and HTML5.
* System administrators must use the same communication protocol for all routes (between the web browser and the Moodle, between the Moodle and the Kaltura, and between the web browser and the Kaltura). It is better to use HTTPS as the communication protocol.
* Administrators must not delete "Default" access control profile from their Kaltura server. If they delete the "Default" profile, they must create new profile named "Default" before install our plugins.
* These plugins do not support Flash players. Therefore, please use HTML5 players.
* "local_yukaltura" plugin.

Supported themes
-----

* Clean
* Boost (version 1.1.7 and later)

This plugin package might be able to work with other themes.

Installation
------

Unzip this plugin, and copy the directory (local/yumymedia) under moodle root directory (ex. /moodle).
Installation will be completed after you log in as an administrator and access the notification menu.

How to use
------

* User's guide, click [here](http://www.cc.yamaguchi-u.ac.jp/guides/cas/plugins/userguide_version1.2.pdf).
* Demonstration web page, click [here](http://www.cc.yamaguchi-u.ac.jp/guides/cas/plugins/demo/).

Targeted Moodle versions
------

Moodle 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

Branches
------

* MOODLE_29_STABLE -> Moodle2.9 branch
* MOODLE_30_STABLE -> Moodle3.0 branch
* MOODLE_31_STABLE -> Moodle3.1 branch
* MOODLE_32_STABLE -> Moodle3.2 branch
* MOODLE_33_STABLE -> Moodle3.3 branch
* MOODLE_34_STABLE -> Moodle3.4 branch
* MOODLE_35_STABLE -> Moodle3.5 branch
* MOODLE_36_STABLE -> Moodle3.6 branch

First clone the repository with "git clone", then "git checkout MOODLE_29_STABLE(branch name)" to switch branches.

Warning
------

* We are not responsible for any problem caused by this software. 
* This software follows the license policy of Moodle (GNU GPL v3).
* "Kaltura" is the registered trademark of the Kaltura Inc.
* Web-camera recording function in "My Media" supports the Mozilla Firefox, Google Chrome, Opera and Safari. For smartphones and tablets, you can record and upload movies through a normal media uploader.
* Uploading and recording functions in resource and activity modules may not work well with smartphones. Because, low resolution screen cannot display these forms correctly.

Change log of YU Kaltura Media Gallery
------

Version 1.2.2

* fixed some statements in delete_media.php, in order to this plugin corresponds to the Kaltura SaaS edition.

Version 1.2.1

* fixed some statements in loaduploader.js, moduleuploader.js, webcamuploader.js, loadrecorder.js, modulerecorder.js, and simpleuploader.js, based on JSDoc warnings.

Version 1.2.0

* added moduleuploader.js, modulerecorder.js, loaduploader.js, and loadrecorder.js, in order to permit user can upload/record new movie in resource moudle (mod_kalmediares) / activity module (mod_kalmediaassign).
* fixed some statements in webcamuploader.js, in order to respond to changes of WebRTC APIs in the Mozilla firefox.

Version 1.1.8R3

* fixed renderer.php, in order to solve an issue about sorting of media.

Version 1.1.8R2

* fixed accessrestriction.js in order to enable iframe-embed and streaming delivery to latest version of Google Chrome.

Version 1.1.8

* added statements about "Requirements" in README.md.
* fixed copyright statements in all scripts.

Version 1.1.7

* fixed statements in lib.php, renderer.php, yumymedia.php and yumymedia.css.
* "My media" supports "Boost" theme of the Moodle. Link to the "My Media" is displayed in the left-side menu of the Boost

Version 1.1.6

* fixed some errors in webcamuploader.js
* fixed statements about "How to use" in README.md.

Version 1.1.5R2

* fixed media delete prodecures in delete_media.php.

Version 1.1.5

* fixed some coding styles in webcamuploader.js.
* added a non-supported OS detection mechanism in webcamuploader.js.
* fixed media delete procedures in delete_media.php.

Version 1.1.4

* fixed documentation of function and some bugs in webcamuploader.js.
* fixed some bugs in yumymedia.js.

Version 1.1.3

* fixed some bugs in simpleuploader.js and webcamuploader.js.

Version 1.1.2

* fixed some strings in local_yumymedia.php.
* fixed some coding style issues in webcamuploader.js
* fixed statement of error messages style in simpleuploader.js and webcam_uploader.js.
* fixed error detection algorithms in simpleuploader.php and webcam_uploader.php
* added statements in README.md.
* separetd mymedia player setting from Kaltura Media Assignment.
* replaced deprecated APIs to new APIs (simpleuploader.js and webcamuploader.js).

Version 1.1.1

* fixed font size issue in uploaders.
* fixed file type check function in javascript.
* fiexd statements in README.md.

Version 1.1.0

* added a webcam upload form(wecam_uploader.php) and releated javascript(webcamuploader.js).
* added a link button to webcam uploade form in "My Media".
* fixed some error messages in simpleuploader.js.
* fixed a filetype detection function in simpleuploader.js.

