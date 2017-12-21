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
 * YU Kaltura "My Media" script for acecss restriction setting.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University (gh-cc@mlex.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module local_yumymedia/accessrestriction
 */

define(['jquery'], function($) {

    return {
        /**
         * Initial function.
         * @access public
         */
        init: function() {

            var STATUS = {
                ENTRY_ERROR_IMPORTING: -2,
                ENTRY_ERROR_CONVERTING: -1,
                ENTRY_IMPORT: 0,
                ENTRY_PRECONVERT: 1,
                ENTRY_READY: 2,
                ENTRY_DELETED: 3,
                ENTRY_PENDING: 4,
                ENTRY_MODERATE: 5,
                ENTRY_BLOCKED: 6,
                ENTRY_NO_CONTENT: 7
            };

            /**
             * This function centerize modal window.
             */
            function centeringModalSyncer() {

                // Get width and height of window.
                var w = $(window).width();
                var h = $(window).height();

                // Get width and height of content area.
                var cw = $("#modal_content").outerWidth();
                var ch = $("#modal_content").outerHeight();

                // Execute centering.
                $("#modal_content").css({"left": ((w - cw) / 2) + "px", "top": ((h - ch) / 2) + "px"});
            }

            /**
             * This function print modal window.
             * @return {bool} - If modal window open, return true. Otherwise return false.
             */
            function fadeInModalWindow() {
                // All contents in web page release focus.
                $(this).blur();
                // Precent dupulicate execute of modal window.
                if ($("#modal_window")[0]) {
                    return false;
                }

                // Create modal window and a content area.
                $("body").append("<div id=\"modal_window\"></div>");
                $("#modal_window").fadeIn("slow");

                // Centering content area.
                centeringModalSyncer();
                // Fade-in content area.
                $("#modal_content").fadeIn("slow");
                return true;
            }

            /**
             * This is callback function whem cancel button is clicked.
             * @param {string} url - URL of taget page.
             */
            function handleCancelClick(url) {
                location.href = url;
            }

            /**
             * This function add back button to modal window.
             * @param {string} url - URL of target page.
             */
            function addBackButton(url) {
                var contentHtml = "<input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=Back />";
                $("#modal_content").append(contentHtml);
                $("#backToMyMedia").on("click", function() {
                    handleCancelClick(url);
                });
            }

            /**
             * This is callback function when access control setting is changed.
             */
            function selectedControl() {
                var selectedControlId = $("#access_control_select").val();
                var currentControlId = $("#currentcontrol").val();

                var newLabel = "Access Control";

                if (selectedControlId != currentControlId) {
                    newLabel = newLabel + " <font color=\"red\">(Changed)</font>";
                    $("#access_media_save").prop("disabled", false);
                } else {
                    $("#access_media_save").prop("disabled", true);
                }

                $("#access_control_label").html(newLabel);
            }

            /**
             * This function update access control id.
             */
            function updateAccessControlId() {
                var entryStatus;
                var findData;

                var controlId = $("#access_control_select").val();
                var entryId = $("#entryid").val();
                var serverHost = $("#kalturahost").val();
                var ks = $("#ks").val();

                // Create form data.
                var fd = new FormData();
                fd.append("action", "update");
                fd.append("ks", ks);
                fd.append("entryId", entryId);
                fd.append("baseEntry:accessControlId", controlId);

                // Create data is transmitted.
                var postData = {
                    type: "POST",
                    data: fd,
                    cache: false,
                    async: true,
                    contentType: false,
                    scriptCharset: "utf-8",
                    processData: false,
                    dataType: "xml"
                };

                var serviceURL = serverHost + "/api_v3/service/baseEntry/action/update";

                // Transmits data.
                $.ajax(
                   serviceURL, postData
                )
                .done(function(xmlData) {
                    // When XML data is not received.
                    if (xmlData === null || typeof xmlData === undefined) {
                        printErrorMessage("Update failed (Cannot get a XML response)");
                        return;
                    }

                    // Get a tag of error code.
                    findData = $(xmlData).find("code");
                    // When error code exists.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        printErrorMessage("Update failed (" + findData.text() + ")");
                        return;
                    }

                    // Get a tag of status.
                    findData = $(xmlData).find("status");
                    // Where tag of statis not exists.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        printErrorMessage("Update failed (Cannot get a baseEntry)");
                        return;
                    }

                    // Get status value.
                    entryStatus = findData.text();
                    // When updating of access control is failed.
                    if (entryStatus != STATUS.ENTRY_READY && entryStatus != STATUS.ENTRY_PENDING &&
                        entryStatus != STATUS.ENTRY_PRECONVERT) {
                        printErrorMessage("Update failed (status of baseEntry: " + entryStatus + ")");
                        return;
                    }

                    // Get a tag of access control.
                    findData = $(xmlData).find("accessControlId");
                    // When tag of acecss control not exists.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        printErrorMessage("Update failed(Cannot get an accessControlId)");
                        return;
                    }

                    // Get a value of access control.
                    var resultId = findData.text();
                    // When updating of access control is failed.
                    if (resultId != controlId) {
                        printErrorMessage("Update failed(accessControlId: " + resultId + ")");
                        return;
                    }

                    // Print a success message.
                    printSuccessMessage(resultId);
                })
                .fail(function(xmlData) {
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    printErrorMessage("Update fialed(Cannot connect to contents server)");
                    return;
                });
            }

            /**
             * This function print a success message.
             * @param {string} currentControl - Label of current access control.
             */
            function printSuccessMessage(currentControl) {
                var mymedia = $("#mymedia").val();
                $("#access_media_save").prop("disabled", true);
                $("#currentcontrol").val(currentControl);

                // Create message.
                var message = "<p>";
                message += "Access control has been updated!<br>";
                message += "Now, jump to mymedia page.";
                message += "</p><br>";

                // View modal window.
                fadeInModalWindow();
                // Append message to content area.
                $("#modal_content").append(message);
                // Append back button to content area.
                addBackButton(mymedia);
                // Close session to kaltura server.
                sessionEnd();
                // Jump tp my media page.
                setTimeout(function() {
                    window.location.replace(mymedia);
                }, 1000);
            }

            /**
             * This function print error message.
             * @param {string} message - message string.
             */
            function printErrorMessage(message) {
                var mymedia = $("#mymedia").val();

                // Create error message.
                message = "<p><font color=red>" + message + "</font></p><br>";
                // View modal window.
                fadeInModalWindow();
                // Append error message to content area.
                $("#modal_content").append(message);
                // Append back buttion to content area.
                addBackButton(mymedia);
                // Close session to kaltura server.
                sessionEnd();
            }

            /**
             * This function close a session between client and kaltura server.
             */
            function sessionEnd() {
                var serverHost = $("#kalturahost").val();
                var serviceURL = serverHost + "/api_v3/service/session/action/end";

                // Transmit from data.
                $.ajax({
                    type: "GET",
                    url: serviceURL,
                    cache: false
                })
                .done(function(xmlData) {
                    // When format of response is not XML.
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                })
                .fail(function(xmlData) {
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                });
            }

            /**
             * This function print embed code for kaltura media.
             */
            function printHtmlCode() {
                var selectedId = $("#code_type_select").val();
                var kalturaHost = $("#kalturahost").val();
                var partnerId = $("#partnerid").val();
                var uiconfId = $("#uiconfid").val();
                var entryId = $("#entryid").val();
                var now = Date.now();
                var str = "";

                if (selectedId == "0") {
                    str = "<iframe src=\"" + kalturaHost + "/p/" + partnerId + "/sp/" + partnerId + "00";
                    str += "/embedIframeJs/uiconf_id/" + uiconfId + "/partner_id/" + partnerId;
                    str += "?iframeembed=true&playerId=kaltura_player_" + now;
                    str += "&entry_id=" + entryId + "\" width=\"560\" height=\"395\" ";
                    str += "allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder=\"0\"></iframe>";
                } else {
                    str = kalturaHost + "/index.php/extwidget/preview/partner_id/";
                    str += partnerId + "/uiconf_id/" + uiconfId + "/entry_id/" + entryId + "/embed/dynamic?";
                }
                $("#codearea").val(str);
            }

            // Entry unload event callback.
            $(window).on("unload", function() {
                sessionEnd();
            });

            // If window is resize, call modal window centerize function.
            $(window).resize(centeringModalSyncer);

            // Entry change event callback.
            $("#access_control_select").on("change", function() {
                selectedControl();
            });

            // Entry change event callback.
            $("#code_type_select").on("change", function() {
                printHtmlCode();
            });

            // Entry click event callback.
            $("#access_media_save").on("click", function() {
                updateAccessControlId();
            });

            printHtmlCode();
        }
    };
});
