# YU Kaltura Media Package
"YU Kaltura Media Package" is a third-party's Kaltura plugin package (a series of plugins) for Moodle 4.3 or later. This package is developed by the Center for Information and Communication Technology Infrastructure, Yamaguchi University. By using this package, users can upload media to the Kaltura server, and easily embed the media in Moodle courses. Moreover, this package provides some useful functions. Since this package does not require Kaltura Application Framework (KAF), can work with Kaltura Community Edition (CE) and other editions.

In order to use this package, administrators must install "[YU Kaltura Media Local Libraries](https://moodle.org/plugins/local_yukaltura)" and "[YU Kaltura Media Gallery](https://moodle.org/plugins/local_yumymedia)".
These plugins provide functions such as uploading, playing back and deleting media files to users.

In addition, the administrators can install "[YU Kaltura Media Assignment](https://moodle.org/plugins/mod_kalmediaassign)", "[YU Kaltura Media Resource](https://moodle.org/plugins/mod_kalmediares)", and "[YU Kaltura Media for Atto](https://moodle.org/plugins/atto_yukaltura)".
These plugins provide teachers ability of creating resource and activity modules which use kaltura media in their Moodle courses.
And, user can embed his/her media into text area (introduction or page content) through the Atto HTML editor.

Please note that there is a chance this module will not work on some Moodle environment. Also, this package is only available in English and Japanese. Stay tuned to future versions for other language supports.

Original plugin package ("Kaltura Video Package") has better functions than ours and is easy to use. So that, for customers of the "Kaltura SaaS Edition", use the original plugin package is the better.

YU Kaltura Media Gallery for Moodle
------

This plugin provides media gallery (called "My Media") for users. Through the "My Media", users can upload media files, record a movie using web-camera, preview and delete their medias, and edit metadata of each media. Also, users can set enable/disable access restriction to their own media. Moreover, user can record a video by using PC's web-camera, and can upload the video to Kaltura server.
Users can get playback page URL and embed code for each media.
This plugin is updated with stable releases. To follow active development on GitHub, click [here](https://github.com/YU-MITC/moodle-local_yumymedia/).

Requirements
------

* PHP 8.0 or greater.
* Web browsers must support the JavaScript and HTML5.
* System administrators must use the HTTPS protocol for their Moodle site and Kaltura server.
* Administrators must not delete "Default" access control profile from their Kaltura server. If they delete the "Default" profile, they must create new profile named "Default" before install our plugins.
* These plugins do not support Flash players. Therefore, please use HTML5 or OVP players.
* "local_yukaltura" plugin.

Supported themes
-----

* Boost (version 1.1.7 and later)
* Classic (version 1.3.0 and later)

This plugin package might be able to work with other themes.

Installation
------

Unzip this plugin, and copy the directory (local/yumymedia) under moodle root directory (ex. /moodle).
Installation will be completed after you log in as an administrator and access the notification menu.

How to use
------

* User's guide, click [here](http://www.cc.yamaguchi-u.ac.jp/guides/cas/plugins/userguide_version3.0.pdf).
* Demonstration web page, click [here](http://www.cc.yamaguchi-u.ac.jp/guides/cas/plugins/demo/).

Targeted Moodle versions
------

Moodle 4.3, 4.4, 4.5

Branches
------

* MOODLE_403_STABLE -> Moodle 4.3 branch
* MOODLE_404_STABLE -> Moodle 4.4 branch
* MOODLE_404_STABLE -> Moodle 4.5 branch

First clone the repository with "git clone", then "git checkout MOODLE_403_STABLE(branch name)" to switch branches.

Warning
------

* We are not responsible for any problem caused by this software. 
* This software follows the license policy of Moodle (GNU GPL v3).
* "Kaltura" is the registered trademark of the Kaltura Inc.
* Web-camera recording function supports the Mozilla Firefox, Google Chrome, Opera and Safari. For smartphones and tablets, you can record and upload movies through a normal media uploader.
* Uploading and recording functions in resource and activity modules may not work well with smartphones. Because, low resolution screen cannot display these forms correctly.

Known issues
------

* In some browsers, preview window (modal window) cannot receive MPEG-DASH/HLS/HDS streaming data. And, if Kaltura server employs HTTPS and users embed their media into web sites employs HTTP, Kaltura players cannot receive streaming data. For local_yumymedia and mod_kalmediaassign, we recommend Kaltura players which receive video using progressive download.

Change log of YU Kaltura Media Gallery
------

Version 3.0.0

* fixed copyright statements in various files.
* fixed yumymedia.php, in order to resolve an undefined property issue in a dynamic defined class.
* fixed yumymedia.php, in order to resolve a media search issue in the Moodle 4.3 and later versions.
* fixed yumymedia.php and renderer.php, in order to use new setting item  (about maximum data size).
* fixed some javascript files, in order to use new setting item  (about maximum data size).
* fixed javascript files, in order to resolve an issue data comparison use "undefined".

Version 2.1.0

* fixed copyright statements in various files.
* fixed provider.php, in order to only support formats employed in Moodle 3.5 and laters.
* fixed renderer.php, in order to support audio players.
* add upgrade.php, in order to support the Moodle 4.1.

Version 2.0.0

* fixed copyright statements in various files.
* fixed various files in order to delete statements using print_error function.
* fixed access_media.php, check_conversion.php, renderer.php, and accessrestriction.js, in order to support Kaltura OVP media players (TV Platform studio).
* fixed yumymedia.php, in order to prevent sort option exception when number of media is small.

Version 1.5.0

* fixed README.md, in order to support the Moodle 3.10.

Version 1.4.2R2

* fixed yumymedia.js, in order to corresponding to Moodle coding style.

Version 1.4.2

* fixed README.md, in order to support the Moodle 3.9.

Version 1.4.1R2

* fixed some statements in renderer.php, in order to properly separate upload URI and server URI.

Version 1.4.1

* fixed some statements in check_conversion.php, in order to properly reflect "My Media" player settings.
* fixed copyright statements in all files.
* fixed access_media.php, check_conversion.php, delete_media.php, renderer.php, save_media_details.php, simple_uploader.php, and yumymedia.php, in order to adopt upload URI.

Version 1.4.0R3

* fixed some statements in renderer.php, and yumymedia.php, in order to resolve an issue about search keyword handling.

Version 1.4.0R2

* fixed video codec selection scheme in modulerecorder.js and webcamuploader.js, in order to support the recent versions of Mozilla Firefox.

Version 1.4.0

* fixed some statements in lib.php, in order to accurately reflect access restrictions to the "My Media".
* fixed javascript files based on JSDoc warnings.
* added privacy functions ans strings to comply with GDPR.
* fixed webcam_uploader.js and module_recorder.js, in order to support Safari 12.x/13.x on macOS.
* fixed "Requirements" in README.md.

Version 1.3.2

* fixed some statements in accessrestriction.js, modulerecorder.js, moduleuploader.js, simpleuploader.js, and webcamuploader.js, in order to according to the Moodle coding style.
* fixed lib.php, and yumymedia.php, in order to fix a logout issue.

Version 1.3.1

* fixed some statements in  delete_media.php and renderer.php, in order to use language strings.
* fixed language file and javascript files, in order to work with a sub plug-in (coming soon) of the Atto editor, to support multi-language on uploader and recorder.

Version 1.3.0

* fixed some statements (about the paging bar) in yumymedia.php and renderer.php, in order to support recently versions of the Moodle 3.x.
* changed display position of a link to the "My Media", in order to support recently versions of the Moodle 3.x. In some themes, the link of the "My Media" is displayed as a child node of the top of "Navigation" block.

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

