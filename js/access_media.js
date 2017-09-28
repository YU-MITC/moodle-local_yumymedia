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
 * @copyright  (C) 2016-2017 Yamaguchi University (info-cc@ml.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var modalX = 0;
var modalY = 0;

var ENTRY_ERROR_IMPORTING = -2;
var ENTRY_ERROR_CONVERTING = -1;
var ENTRY_IMPORT = 0;
var ENTRY_PRECONVERT = 1;
var ENTRY_READY = 2;
var ENTRY_DELETED = 3;
var ENTRY_PENDING = 4;
var ENTRY_MODERATE = 5;
var ENTRY_BLOCKED = 6;
var ENTRY_NO_CONTENT = 7;

window.onload = function() {
    document.getElementById("access_media_save").disabled = true;
    printHtmlCode();
};

/**
 *  Entry a uload event callback.
 */
window.unload = function() {
    sessionEnd();
};

/**
 * If window is resize, call modal window centerize function.
 */
$(window).resize(centeringModalSyncer);

/**
 * This function centerize modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function centeringModalSyncer(){

    // Get width and height of window.
    var w = $(window).width();
    var h = $(window).height();

    // Get width and height of content area.
    var cw = $("#modal_content").outerWidth();
    var ch = $("#modal_content").outerHeight();

    // Execute centering.
    $("#modal_content").css({"left": ((w - cw) / 2) + "px","top": ((h - ch) / 2) + "px"});
}

/**
 * This function print modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function fadeInModalWindow() {
    // All contents in web page release focus.
    $(this).blur();
    // Precent dupulicate execute of modal window.
    if($("#modal_window")[0]) {
        return false;
    }

    // Record current scroll position.
    var dElm = document.documentElement , dBody = document.body;
    modalX = dElm.scrollLeft || dBody.scrollLeft; // Get x value of current position.
    modalY = dElm.scrollTop || dBody.scrollTop; // Get y valueion of current position.
    // Create modal window and a content area.
    $("body").append("<div id=\"modal_window\"></div>");
    $("#modal_window").fadeIn("slow");

    // Centering content area.
    centeringModalSyncer();
    // Fade-in content area.
    $("#modal_content").fadeIn("slow");
}

/**
 * This function delete content area and modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function fadeOutModalWindow() {
    // Rescore scroll position to web brawser.
    window.scrollTo( modalX , modalY );

    // Fade-put content area and modal window.
    $("#modal_content,#modal_window").fadeOut("slow",function(){
        $("#modal_window").remove();
        $("#modal_content").remove();
    });
}

/**
 * This function add back button to modal window.
 * @access private
 * @param {string} - URL of target page.
 * @return nothing.
 */
function addBackButton(url) {
    var content_html = "<input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=Back ";
    content_html = content_html + "onclick=\"handleCancelClick(" + url + ")\" />";
    $("#modal_content").append(content_html);
}

/**
 * This is callback function whem cancel button is clicked.
 * @access public
 * @param {string} - URL of taget page.
 * @return nothing.
 */
function handleCancelClick(url) {
    location.href = url;
}

/**
 * This is callback function when access control setting is changed.
 * @access public
 * @param none.
 * @return nothing.
 */
function selectedControl()
{
    var selected_control = $("#access_control_select").val();
    var current_control = $("#currentcontrol").val();

    var new_label = "Access Control";

    if (selected_control != current_control) {
        new_label = new_label + " <font color=\"red\">(Changed)</font>";
        document.getElementById("access_media_save").disabled = false;
    }
    else {
        document.getElementById("access_media_save").disabled = true;
    }

    document.getElementById("access_control_label").innerHTML = new_label;
}

/**
 * This function update access control id.
 * @access public
 * @param none.
 * @return nothing.
 */
function updateAccessControlId()
{
    var entryStatus;
    var findData;
    var errorMessage = "";

    var controlId = $("#access_control_select").val();
    var entry_id = $("#entryid").val();
    var server_host = $("#kalturahost").val();
    var ks = $("#ks").val();

    // Create form data.
    var fd = new FormData();
    fd.append("action", "update");
    fd.append("ks", ks);
    fd.append("entryId", entry_id);
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

    var serviceURL = server_host + "/api_v3/service/baseEntry/action/update";

    // Transmits data.
    $.ajax (
       serviceURL, postData
    )
    .done(function(xmlData){
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
        if (entryStatus != ENTRY_READY && entryStatus != ENTRY_PENDING && entryStatus != ENTRY_PRECONVERT) {
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
    .fail(function(xmlData){
        printErrorMessage("Update fialed(Cannot connect to contents server)");
        return;
    });
}

/**
 * This function print a success message.
 * @access public
 * @param {string} - Label of current access control.
 * @return nothing.
 */
function printSuccessMessage(current_control)
{
    var mymedia = document.getElementById("mymedia").value;
    document.getElementById("access_media_save").disabled = true;
    document.getElementById("currentcontrol").value = current_control;

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
    setTimeout(function(){window.location.replace(mymedia);}, 1000);
}

/**
 * This function print error message.
 * @access public
 * @param {string} - message string.
 * @return nothing.
 */
function printErrorMessage(message)
{
    var mymedia = document.getElementById("mymedia").value;

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
 * @access public
 * @param none.
 * @return nothing.
 */
function sessionEnd()
{
    var server_host = $("#kalturahost").val();
    var ks = $("#ks").val();
    var serviceURL = server_host + "/api_v3/service/session/action/end";

    // Transmit from data.
    $.ajax ({
        type : "GET",
        url : serviceURL,
        cache : false
    })
    .done(function( xmlData ) {
        // When format of response is not XML.
        if (xmlData === null) {
        }
        else {;
        }
    })
    .fail(function( xmlData ) {
        // Do nothing if uploadToken cannot delete.
    });
}

/**
 * This function print embed code for kaltura media.
 * @access public
 * @param none.
 * @return nothing.
 */
function printHtmlCode()
{
    var selected_id = document.getElementById("code_type_select").value;
    var kaltura_host = document.getElementById("kalturahost").value;
    var partner_id = document.getElementById("partnerid").value;
    var uiconf_id = document.getElementById("uiconfid").value;
    var entry_id = document.getElementById("entryid").value;
    var now = Date.now();
    var str = "";

    if (selected_id == "0") {
        str = "<iframe src=\"" + kaltura_host + "/p/" + partner_id + "/sp/" + partner_id + "00";
        str += "/embedIframeJs/uiconf_id/" + uiconf_id + "/partner_id/" + partner_id;
        str += "?iframeembed=true&playerId=kaltura_player_" + now;
        str += "&entry_id=" + entry_id + "\" width=\"560\" height=\"395\" ";
        str += "allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder=\"0\"></iframe>";
    }
    else {
        str = kaltura_host + "/index.php/extwidget/preview/partner_id/";
        str += partner_id + "/uiconf_id/" + uiconf_id + "/entry_id/" + entry_id + "/embed/dynamic?";
    }
    document.getElementById("codearea").value = str;
}
