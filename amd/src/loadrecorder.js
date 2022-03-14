// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * YU Kaltura "My Media" script in order to load webcam uploader with modal window.
 *
 * @copyright  (C) 2016-2022 Yamaguchi University (gh-cc@mlex.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module local_yumymedia/loadrecorder
 */
define(['jquery'], function($) {

    return {
        /**
         * Initial function.
         * @access public
         * @param {string} uploaderUrl - url of simple selector page.
         */
        init: function(uploaderUrl) {
            var timer = false;

            /**
             * This function prints modal window.
             * @access public
             * @param {string} url - URL of iframe content.
             * @return {bool} - If modal window open, return true. Otherwise, return false.
             */
            function fadeInRecorderWindow(url) {
                // Window Unfocus for avoid duplication.
                $(this).blur();
                if ($("#modal_window")[0]) {
                    return false;
                }

                // Print overlay.
                $("body").append("<div id=\"modal_window\"></div>");
                $("body").append("<div id=\"uploader_content\"></div>");
                $("#modal_window").fadeIn("slow");
                // Centering content.
                centeringModalSyncer("#uploader_content");
                // Fade-in modal content.
                $("#uploader_content").fadeIn("slow");
                // Set url of content.
                $("#uploader_content").html("<iframe src=\"" + url + "\" width=\"100%\" height=\"100%\">");
                // Centering content.
                centeringModalSyncer("#uploader_content");

                $(parent.window).resize(function() {
                    centeringModalSyncer("#uploader_content");
                });

                return true;
            }

            /**
             * This function centerizes a modal window.
             * @access public
             * @param {object} contentPanel - HTML element of modal content.
             */
            function centeringModalSyncer(contentPanel) {
                if (timer !== false) {
                    clearTimeout(timer);
                }

                timer = setTimeout(function() {
                    // Get width and height of window.
                    var w = $(window).width();
                    var h = $(window).height();

                    // Get width and height of modal_content.
                    var cw = $(contentPanel).outerWidth();
                    var ch = $(contentPanel).outerHeight();

                    // Execute centerize.
                    $(contentPanel).css({"left": ((w - cw) / 2) + "px", "top": ((h - ch) / 2) + "px"});
                }, 200);
            }

            $("#id_record_media").on("click", function() {
                fadeInRecorderWindow(uploaderUrl);
            });
        }
    };
});
