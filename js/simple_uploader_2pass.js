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
 * YU Kaltura "My Media" script for simple uploader.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University (info-cc@ml.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var modalX = 0;
var modalY = 0;

var UPLOAD_TOKEN_PENDING = 0;
var UPLOAD_TOKEN_PARTIAL_UPLOAD = 1;
var UPLOAD_TOKEN_FULL_UPLOAD = 2;
var UPLOAD_TOKEN_CLOSED = 3;
var UPLAOD_TOKEN_TIMED_OUT = 4;
var UPLOAD_TOKEN_DELETED = 5;

var MEDIA_TYPE_VIDEO = 1;
var MEDIA_TYPE_IMAGE = 2;
var MEDIA_TYPE_AUDIO = 5;

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

var file_size = 0;

var SHORTEST_TIME = 20000;

/**
 * This function execute when window is loaded.
 * @access public
 * @param none.
 * @return nothing.
 */
window.onload = function(){
    checkForm();
};

/**
 * This function execute when window is chagned.
 * @access public
 * @param none.
 * @return nothing.
 */
window.onchange = function(){
    checkForm();
};

/**
 * This function execute when window is uloaded.
 * @access public
 * @param none.
 * @return nothing.
 */
window.unload = function() {
    sessionEnd();
};

/**
 * This function execute when window is resized.
 * @access public
 * @param function - callback function.
 * @return nothing.
 */
$(window).resize(centeringModalSyncer);

/**
 * This function centerizes a modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function centeringModalSyncer(){

    // Get width and height of window.
    var w = $(window).width();
    var h = $(window).height();

    // Get width and height of modal_content.
    var cw = $("#modal_content").outerWidth();
    var ch = $("#modal_content").outerHeight();

    // Execute centerize.
    $("#modal_content").css({"left": ((w - cw) / 2) + "px", "top": ((h - ch) / 2) + "px"});
}

/**
 * This function checks file size.
 * @access public
 * @param none.
 * @return nothing.
 */
function checkFileSize() {
    if (file_size <= 0) {
        return false;
    }
    if (file_size > 2000000000) {
        return false;
    }
    return true;
}

/**
 * This function checks file type.
 * @access public
 * @param {string} - file type of selected media.
 * @return {string} - media type string for kaltura server.
 */
function checkFileType(file_type) {
    if (file_type == "video/avi" || file_type == "video/x-msvideo" ||
        file_type == "video/mpeg" || file_type == "video/mpg" || file_type == "video/mp4" ||
        file_type == "video/ogg" ||
        file_type == "video/quicktime" || file_type == "video/VP8" ||
        file_type == "video/x-flv" || file_type == "video/x-f4v" ||
        file_type == "video/x-matroska" ||
        file_type == "video/x-ms-wmv") {
        return "video";
    }

    if (file_type == "audio/ac3" || file_type == "audio/ogg" ||
        file_type == "audio/mpeg" || file_type == "audip/mp4" ||
        file_type == "audio/wav" || file_type == "audio/x-ms-wma") {
        return "audio";
    }

    if (file_type == "image/gif" || file_type == "image/jpeg" ||
        file_type == "image/png" || file_type == "image/tiff") {
        return "image";
    }

    return "N/A";
}

/*
 * This function checks metadata.
 */
function checkForm() {
    if ($("#fileData") === null ||
        $("#fileData").files === null ||
        $("#name").val() === "" ||
        $("#tags").val() === "" ||
        $("#type").val() === "" ||
        $("#type").val() === "N/A") {
        // Dsiable upload button.
        $("#entry_submit").prop("disabled", true);
        $("#entry").val("");
    }
    else {
        // Enable upload button.
        $("#entry_submit").prop("disabled", false);
    }
}

/*
 * This function print simple uploader.
 */
function openSimpleUploader() {
    location.href = "./simple_uploader.php";
}

/**
 * This function is callback for cancel button.
 * @access public
 * @param none.
 * @return nothing.
 */
function handleCancelClick() {
    location.href = "./yumymedia.php";
}

/**
 * This function prints modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function fadeInModalWindow() {
    // Window Unfocus for avoid duplication.
    $(this).blur();
    if ($("#modal_window")[0]) {
        return false;
    }

    // Records scroll position of window.
    var dElm = document.documentElement , dBody = document.body;
    modalX = dElm.scrollLeft || dBody.scrollLeft;   // X position.
    modalY = dElm.scrollTop || dBody.scrollTop;     // Y position.
    // Print overlay.
    $("body").append("<div id=\"modal_window\"></div>");
    $("#modal_window").fadeIn("slow");

    // Execure centerrize.
    centeringModalSyncer();
    // Fade-in modal window.
    $("#modal_content").fadeIn("slow");
}

/**
 * This function deletes a modal window.
 * @access public
 * @param none.
 * @return nothing.
 */
function fadeOutModalWindow() {
    // Rescore scroll position of window.
    window.scrollTo( modalX , modalY );
    // Fade-out [#modal_content] and [#modal_window].
    $("#modal_content,#modal_window").fadeOut("slow",function(){
        // Delete [#modal_window].
        $("#modal_window").remove();
        $("#modal_content").remove();
    });
}

/**
 * This function adds back button.
 * @access public
 * @param none.
 * @return nothing.
 */
function addBackButton() {
    var content_html = "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=Back ";
    content_html = content_html += "onclick=\"handleCancelClick()\" />";
    $("#modal_content").append(content_html);
}

/**
 * This function prints error message.
 * @access public
 * @param {string} - string of error message.
 * @return nothing.
 */
function printErrorMessage(errorMessage) {
    $("#modal_content").append("<font color=\"red\">" + errorMessage + "</font><br>");
    addBackButton();
}

/*
 * This function prints success message.
 */
/**
 * This function prints success message.
 * @access public
 * @param {string} - id of media entry.
 * @param {string} - name of media entry.
 * @param {string} - description of media entry.
 * @param {string} - username of creator.
 * @return nothing.
 */
function printSuccessMessage(id, name, tags, description, creatorId) {
    // Delete modal window.
    fadeOutModalWindow();

    var output = "<h3>Your upload has been suceeded !</h3>";

    output += "<table border=\"2\" cellpadding=\"5\">";
    output += "<tr><td>entry id</td><td>" + id + "</td></tr>";
    output += "<tr><td>name</td><td>" + name + "</td></tr>";
    output += "<tr><td>tags</td><td>" + tags + "</td></tr>";
    output += "<tr><td>description</td><td>" + description + "</td></tr>";
    output += "<tr><td>creator id</td><td>" + creatorId + "</td></tr>";
    output += "</table>";
    output += "<br>";
    output += "<input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" onclick=\"handleCancelClick()\" />";

    $("#upload_info").html(output);
}

/**
 * This function is callback for reset button.
 * @access public
 * @param none.
 * @return nothing.
 */
function handleResetClick() {
    $("#file_info").html("");
    $("#type").val("");
}

/**
 * This function checks name of media.
 * @access public
 * @param {string} - name of media.
 * @return {bool} - if name is appropriate, return "true". Otherwise, return "false".
 */
function checkNameString(str) {
    var regex = /["$%&'~\^\\`\/]/;
    if (regex.test(str) === true) {
        return false;
    }
    else {
        return true;
    }
}

/**
 * This function checks tags of media.
 * @access public
 * @param {string} - tagas of media.
 * @return {bool} - if tags are appropriate, return "true". Otherwise, return "false".
 */
function checkTagsString(str) {
    var regex = /[!"#$%&'~\|\^\\@`()\[\]\{\}:;\+\*\/=<>?]/;
    if (regex.test(str) === true) {
        return false;
    }
    else {
        return true;
    }
}

/**
 * This function checks metadata of media.
 * @access public
 * @param none.
 * @return {bool} - if metadata is appropriate, return "true". Otherwise, return "false".
 */
function checkMetadata() {
    var name_str = $("#name").val();
    var tags_str = $("#tags").val();
    var desc_str = $("#description").val();

    if (checkNameString(name_str) === false) {
        alert("There is wrong letter(s) in <Name>.");
        return false;
    }

    if (checkTagsString(tags_str) === false) {
        alert("There is wrong letter(s) in <Tags>.");
        return false;
    }

    if (checkNameString(desc_str) === false) {
        alert("There is wrong letter(s) in <Description>.");
        return false;
    }

    return true;
}

/**
 * This function is callback for submit button.
 * @access public
 * @param none.
 * @return nothing.
 */
function handleSubmitClick() {

    if (checkMetadata() === false) {
        return false;
    }
    if (checkFileSize() === false) {
        alert("Wrong file size.");
        return false;
    }

    fadeInModalWindow(); // Prints modal window.

    executeUploadProcess(); // Executes upload.
}

/**
 * This function executes upload process.
 * @access public
 * @param none.
 * @return nothing.
 */
function executeUploadProcess() {
    var server_host = $("#kalturahost").val(); // Get hostname of kaltura server.
    var ks = $("#ks").val(); // Get session id.
    // Uploadgin media file.
    uploadMediaFile(server_host, ks);
}

/**
 * This function deletes upload token.
 * @access public
 * @param {string} - hostname of kaltura server.
 * @param {string} - session string of kaltura connection.
 * @param {string} - token id for uploading.
 * @return nothing.
 */
function deleteUploadToken(server_host, ks, uploadTokenId) {
    var fd = new FormData();
    var flag;

    // Set form data.
    fd.append("action", "delete");
    fd.append("ks", ks);
    fd.append("uploadTokenId", uploadTokenId);

    // Set transmission data.
    var postData = {
        type: "POST",
        data: fd,
        cache: false,
        contentType: false,
        scriptCharset: "utf-8",
        processData: false,
        async: true,
        dataType: "xml"
    };

    var serviceURL = server_host + "/api_v3/service/uploadToken/action/delete";

    // Transmits a data.
    $.ajax (
        serviceURL, postData
    )
    .done(function( xmlData ) {
        // When response is not XML.
        if (xmlData === null) {
            flag = false;
        }

        flag = true;
    })
    .fail(function( xmlData ) {
        flag = false;
    });

    return flag;
}

/*
 * This function uploads media file.
 */
/**
 * This function uploads media file.
 * @access public
 * @param {string} - hostname of kaltura server.
 * @param {string} - session string of kaltura connection.
 * @return nothing.
 */
function uploadMediaFile(server_host, ks) {
    var uploadTokenId;
    var findData;
    var errorMessage = "";

    var fd = new FormData();

    // Creates form data.
    fd.append("action", "upload");
    fd.append("fileData", $("input[name='fileData']").prop("files")[0]);
    fd.append("ks", ks);

    // Creates transmission data.
    var postData = {
        type: "POST",
        data: fd,
        cache: false,
        async: true,
        contentType: false,
        scriptCharset: "utf-8",
        processData: false,
        dataType: "xml",
        xhr: function() {
            var XHR = $.ajaxSettings.xhr();
            if(XHR.upload){
                XHR.upload.addEventListener("progress",function(e) {
                    var new_value = parseInt(e.loaded / e.total * 10000) / 100;
                    $("#pvalue").html(parseInt(new_value));
                }, false);
            }
            return XHR;
        }
    };

    var serviceURL = server_host + "/api_v3/service/media/action/upload";

    $("#modal_content").append("Uploading a media file ...<br>");

    $("#modal_content").append("<p>Progress: <span id=\"pvalue\" style=\"color:#00b200\">0.00</span> %</p>");

    // Transmits data.
    $.ajax (
        serviceURL, postData
    )
    .done(function( xmlData, textStatus, xhr) {
        // Response is not XML.
        if (xmlData === null) {
            deleteUploadToken(server_host, ks, uploadTokenId);
            printErrorMessage("Cannot upload the file !<br>(Cannot get a XML response.)");
            return;
        }
        // Get a tag of error code.
        findData = $(xmlData).find("code");
        // There exists error code.
        if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
            printErrorMessage("Cannot upload the file !<br>(" + findData.text() + ")");
            return;
        }

        // Get upload token id.
        findData = $(xmlData).find("result");
        // There not exists upload token id.
        if (findData === null || typeof findData === undefined || findData.text() === "") {
            printErrorMessage("Cannot upload the file !<br>(Cannot get an uploadTokenId.)");
            return;
        }
        // Get a value of upload token id.
        uploadTokenId = findData.text();

        $("#modal_content").append("Uploading an attirbute information ...<br>");

        var backend_host = xhr.getResponseHeader("X-Me");
        if (backend_host != null) {
            if (server_host.indexOf("https") == 0) {
                server_host = "https://" + backend_host;
            }
            else if (server_host.indexOf("http") == 0){
                server_host = "http://" + backend_host;
            }
        }

        // Entry metadata.
        setTimeout(function(){uploadAttributes(server_host, ks, uploadTokenId);}, 1000);
    })
    .fail(function( xmlData ) {
        deleteUploadToken(server_host, ks, uploadTokenId);
        printErrorMessage("Cannot upload the file !<br>(Cannot connect to contents server.)");

    });
}

/**
 * This function uploads metadata.
 * @access public
 * @param {string} - hostname of kaltura server.
 * @param {string} - session string of kaltura connection.
 * @param {string} - upload token id.
 * @return nothing.
 */
function uploadAttributes(server_host, ks, uploadTokenId) {

    var findData;
    var entryStatus;
    var errorMessage = "";
    var entry_id = "";
    var entry_name = "";
    var entry_tags = "";
    var entry_description = "";
    var entry_creatorId = "";
    var type = $("#type").val();
    var mediaType = "";

    if (type == "image") {
        mediaType = MEDIA_TYPE_IMAGE;
    }
    else if (type == "audio") {
        mediaType = MEDIA_TYPE_AUDIO;
    }
    else {
        mediaType = MEDIA_TYPE_VIDEO;
    }

    var name_str = $("#name").val();
    var tags_str = $("#tags").val();
    var desc_str = $("#description").val();
    var controlId = $("#controlId").val();

    name_str = name_str.trim();
    tags_str = tags_str.trim();
    if (desc_str !== null) {
        desc_str = desc_str.trim();
    }

    // Creates form data.
    var fd = new FormData();
    fd.append("action", "addFromUploadedFile");
    fd.append("ks", ks);
    fd.append("uploadTokenId", uploadTokenId);
    fd.append("mediaEntry:name", name_str);
    fd.append("mediaEntry:tags", tags_str);
    if (desc_str !== null && desc_str !== "") {
        fd.append("mediaEntry:description", desc_str);
    }
    else {
        fd.append("mediaEntry:description", "");
    }
    fd.append("mediaEntry:categories", $("#categories").val());
    fd.append("mediaEntry:creatorId", $("#creatorId").val());
    fd.append("mediaEntry:userId", $("#creatorId").val());
    fd.append("mediaEntry:mediaType", mediaType);
    fd.append("mediaEntry:accessControlId", controlId);

    // Creates transmission data.
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

    var serviceURL = server_host + "/api_v3/service/media/action/addFromUploadedFile";

    // Transmits data.
    $.ajax (
        serviceURL, postData
    )
    .done(function(xmlData){
        // Response is not XML.
        if (xmlData === null || typeof xmlData === undefined) {
            deleteUploadToken(server_host, ks, uploadTokenId);
            printErrorMessage("Cannot upload the attribute information !<br>(Cannot get a XML response.)");
            return;
        }

        // Get a tag of error code.
        findData = $(xmlData).find("code");
        // There exists error code.
        if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
            deleteUploadToken(server_host, ks, uploadTokenId);
            printErrorMessage("Cannot upload the attribute information !<br>(" + findData.text() + ")");
            return;
        }

        // Get a tag of status.
        findData = $(xmlData).find("status");
        // There not exists a tag of status.
        if (findData === null || typeof findData === undefined || findData.text() === "") {
            deleteUploadToken(server_host, ks, uploadTokenId);
            printErrorMessage("Cannot upload the attribute information !<br>(Cannot get a mediaEntryStatus.)");
            return;
        }

        // Get a value of status.
        entryStatus = findData.text();
        // When uploading of metadata failed.
        if (entryStatus != ENTRY_READY && entryStatus != ENTRY_PENDING && entryStatus != ENTRY_PRECONVERT) {
            deleteUploadToken(server_host, ks, uploadTokenId);
            printErrorMessage("Cannot upload the attribute information !<br>(mediaEntryStatus: " + entryStatus + ")");
            return;
        }

        // Get a tag of entry id.
        findData = $(xmlData).find("id");
        // Get a value of entry id.
        entry_id = findData.text();
        // Get a tag of name.
        findData = $(xmlData).find("name");
        // Get a value of name.
        entry_name = findData.text();
        // Get a tag of tags.
        findData = $(xmlData).find("tags");
        // Get a value of tags.
        entry_tags = findData.text();
        // Get a tag of description.
        findData = $(xmlData).find("description");
        // There exists description.
        if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
            // Get a value of description.
            entry_description = findData.text();
        }
        else {
            entry_description = "";
        }
        // Get a tago of creator id.
        findData = $(xmlData).find("creatorId");
        // Get a value of creator id.
        entry_creatorId = findData.text();

        // Prints back button.
        addBackButton();
        // Prints success message.
        printSuccessMessage(entry_id, entry_name, entry_tags, entry_description, entry_creatorId);
    })
    .fail(function(xmlData){
        deleteUploadToken(server_host, ks, uploadTokenId);
        printErrorMessage("Cannot upload the attribute information !<br>(Cannot connect to contents server.)");
        return;
    });
}

/**
 * This function retrieve os type.
 * @access public
 * @param none.
 * @return {string} - os type.
 */
function getOperatingSystem() {
    var os, ua = navigator.userAgent;

    if (ua.match(/iPhone|iPad/)) {
        os = "iOS";
    } else if (ua.match(/Android/)) {
        os = "Android";
    } else if (ua.match(/Linux/)) {
        os = "Linux";
    } else if (ua.match(/Win(dows)/)) {
        os = "Windows";
    }
    else if (ua.match(/Mac|PPC/)) {
        os = "Mac OS";
    }
    else {
        os = "Other";
    }

    return os;
}

/**
 * This function is callback for selection of media file.
 * @access public
 * @param {array} - array of file object.
 * @return nothing.
 */
function handleFileSelect(files) {
    // Get os type.
    var os = getOperatingSystem();

    // There exists selected file.
    if (files) {
        // Get an object of selected file.
        var file = files[0];

        file_size = parseInt(escape(file.size));
        var type_result = checkFileType(escape(file.type));
        var size_result = checkFileSize();
        var alert_info = "";

        // When file size is wrong.
        if (size_result === false) {
            alert_info += "Wrong file size.";
        }
        // When file is no supported.
        if (type_result == "N/A") {
            alert_info += "Unsupported file type.";
        }

        // When any warning occures.
        if (alert_info !== "") {
            alert(alert_info);
            $("#file_info").html("");
            $("#name").val("");
            $("#tags").val("");
            $("#description").val("");
            $("#type").val("");
            files = null;
        }
        else {  // When any warning do not occures.
            var file_info = "";
            var str = file.name;
            var converted_name = "";

            // When os of client is windows.
            if (os.match("Windows")) {
                var str_array = str.split(""); // Convert string to char array.
                var utf8Array = Encoding.convert(str_array, "UTF8", "AUTO"); // Convert chatacter code.
                converted_name = utf8Array.join("");// Rescore string from char array.
            }
            else {  // When os of client is not windows.
                converted_name = str;
            }

            var size_str = "";

            if (file_size > 1024 * 1024 * 1024) {  // When file size exceeds 1GB.
                file_size = file_size / (1024 * 1024 * 1024);
                size_str = file_size.toFixed(2) + " G";
            }
            else if (file_size > 1024 * 1024) {  // When file size exceeds 1MB.
                file_size = file_size / (1024 * 1024);
                size_str = file_size.toFixed(2) + " M";
            }
            else if (file_size > 1024) {  // When file size exceeds 1kB.
                file_size = file_size / 1024;
                size_str = file_size.toFixed(2) + " k";
            }
            else {  // When file size under 1kB.
                size_str = file_size + " ";
            }

            file_info += "<div id=metadata_fields>";
            file_info += "Size: " + size_str + "bytes<br>";
            file_info += "MIME Type: " + escape(file.type) + "<br>";
            file_info += "</div><hr>";

            $("#file_info").html(file_info);
            $("#name").val(converted_name);
            $("#type").val(type_result);
        }
    }

    checkForm();
}

/**
 * This function close kaltura session.
 * @access public
 * @param none.
 * @return nothing.
 */
function sessionEnd()
{
    var server_host = $("#kalturahost").val(); // Get hostname of kaltura server.
    var ks = $("#ks").val(); // Get session id.
    var serviceURL = server_host + "/api_v3/service/session/action/end";

    // Transmits data.
    $.ajax ({
        type: "GET",
        url: serviceURL,
        cache: false
    })
    .done(function( xmlData ) {
        // Response is not XML.
        if (xmlData === null) {
            /**
             * alert("Cannot delete the uploadToken ! (Cannot get a XML response.)");
             */
        }
        else {
            /**
             * alert("Kaltura Session has been deleted.");
             */
        }
    })
    .fail(function( xmlData ) {
        /**
         *  alert("Cannot delete the uploadToken ! (Cannot connect to contents server.)");
         */
    });
}
