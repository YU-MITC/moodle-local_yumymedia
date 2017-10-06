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

/**
 * @module local_yumymedia/simpleuploader
 */

define(['jquery'], function($) {

    return {
        /**
         * Initial function.
         * @access
         */
        init: function() {

            var modalX = 0;
            var modalY = 0;

            var fileSize = 0;

            var MEDIA_TYPE = {
                VIDEO : 1,
                IMAGE : 2,
                AUDIO : 5
            };

            var STATUS = {
                ENTRY_IMPORTING : -2,
                ENTRY_CONVERTING : -1,
                ENTRY_IMPORT : 0,
                ENTRY_PRECONVERT : 1,
                ENTRY_READY : 2,
                ENTRY_DELETED : 3,
                ENTRY_PENDING : 4,
                ENTRY_MODERATE : 5,
                ENTRY_BLOCKED : 6,
                ENTRY_NO_CONTENT : 7
            };

            // This function centerizes a modal window.
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
             * @return {bool} - The file can upload?
             */
            function checkFileSize() {
                if (fileSize <= 0) {
                    return false;
                }
                if (fileSize > 2000000000) {
                    return false;
                }
                return true;
            }

            /**
             * This function checks file type.
             * @access public
             * @param {string} fileType - file type of selected media.
             * @return {string} - media type string for kaltura server.
             */
            function checkFileType(fileType) {
                if (fileType == "video/avi" || fileType == "video/x-msvideo" ||
                    fileType == "video/mpeg" || fileType == "video/mpg" || fileType == "video/mp4" ||
                    fileType == "video/ogg" ||
                    fileType == "video/quicktime" || fileType == "video/VP8" ||
                    fileType == "video/x-flv" || fileType == "video/x-f4v" ||
                    fileType == "video/x-matroska" ||
                    fileType == "video/x-ms-wmv") {
                    return "video";
                }

                if (fileType == "audio/ac3" || fileType == "audio/ogg" ||
                    fileType == "audio/mpeg" || fileType == "audip/mp4" ||
                    fileType == "audio/wav" || fileType == "audio/x-ms-wma") {
                    return "audio";
                }

                if (fileType == "image/gif" || fileType == "image/jpeg" ||
                    fileType == "image/png" || fileType == "image/tiff") {
                    return "image";
                }

                return "N/A";
            }

            /*
             * This function checks metadata.
             * @access public
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

            /**
             * This function is callback for cancel button.
             * @access public
             */
            function handleCancelClick() {
                location.href = "./yumymedia.php";
            }

            /**
             * This function prints modal window.
             * @access public
             * @return {boole} - If modal window open, return true. Otherwise, return false.
             */
            function fadeInModalWindow() {
                // Window Unfocus for avoid duplication.
                $(this).blur();
                if ($("#modal_window")[0]) {
                    return false;
                }

                // Records scroll position of window.
                var dElm = document.documentElement;
                var dBody = document.body;
                modalX = dElm.scrollLeft || dBody.scrollLeft;   // X position.
                modalY = dElm.scrollTop || dBody.scrollTop;     // Y position.
                // Print overlay.
                $("body").append("<div id=\"modal_window\"></div>");
                $("#modal_window").fadeIn("slow");

                // Execure centerrize.
                centeringModalSyncer();
                // Fade-in modal window.
                $("#modal_content").fadeIn("slow");

                return true;
            }

            /**
             * This function deletes a modal window.
             * @access public
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
             */
            function addBackButton() {
                var contentHtml = "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";
                $("#modal_content").append(contentHtml);

                $("#backToMymedia").on("click", function() {
                    handleCancelClick();
                });

            }

            /**
             * This function prints error message.
             * @access public
             * @param {string} errorMessage - string of error message.
             */
            function printErrorMessage(errorMessage) {
                $("#modal_content").append("<font color=\"red\">" + errorMessage + "</font><br>");
                addBackButton();
            }

            /**
             * This function prints success message.
             * @access public
             * @param {string} id - id of media entry.
             * @param {string} name - name of media entry.
             * @param {string} tags - tags of media entry.
             * @param {string} description - description of media entry.
             * @param {string} creatorId - username of creator.
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
                output += "<input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";

                $("#upload_info").html(output);

                $("#backToMymedia").on("click", function() {
                    handleCancelClick();
                });
            }

            /**
             * This function is callback for reset button.
             * @access public
             */
            function handleResetClick() {
                $("#file_info").html("");
                $("#type").val("");
            }

            /**
             * This function checks name of media.
             * @access public
             * @param {string} str - name of media.
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
             * @param {string} str - tagas of media.
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
             * @return {bool} - if metadata is appropriate, return "true". Otherwise, return "false".
             */
            function checkMetadata() {
                var nameStr = $("#name").val();
                var tagsStr = $("#tags").val();
                var descStr = $("#description").val();

                if (checkNameString(nameStr) === false) {
                    window.alert("There is wrong letter(s) in <Name>.");
                    return false;
                }

                if (checkTagsString(tagsStr) === false) {
                    window.alert("There is wrong letter(s) in <Tags>.");
                    return false;
                }

                if (checkNameString(descStr) === false) {
                    window.alert("There is wrong letter(s) in <Description>.");
                    return false;
                }

                return true;
            }

            /**
             * This function is callback for submit button.
             * @access public
             * @return {bool} - if file is uploaded, return true. Otherwise, return false.
             */
            function handleSubmitClick() {

                if (checkMetadata() === false) {
                    return false;
                }
                if (checkFileSize() === false) {
                    window.alert("Wrong file size.");
                    return false;
                }

                fadeInModalWindow(); // Prints modal window.
                executeUploadProcess(); // Executes upload.

                return true;
            }

            /**
             * This function executes upload process.
             * @access public
             */
            function executeUploadProcess() {
                var serverHost = $("#kalturahost").val(); // Get hostname of kaltura server.
                var ks = $("#ks").val(); // Get session id.
                // Uploadgin media file.
                uploadMediaFile(serverHost, ks);
            }

            /**
             * This function deletes upload token.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             * @param {string} uploadTokenId - token id for uploading.
             */
            function deleteUploadToken(serverHost, ks, uploadTokenId) {
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

                var serviceURL = serverHost + "/api_v3/service/uploadToken/action/delete";

                // Transmits a data.
                $.ajax (
                    serviceURL, postData
                )
                .done(function(xmlData) {
                    // When response is not XML.
                    if (xmlData === null) {
                        flag = false;
                    }
                    flag = true;
                })
                .fail(function(xmlData) {
                    flag = false;
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                });

                return flag;
            }

            /**
             * This function uploads media file.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             */
            function uploadMediaFile(serverHost, ks) {
                var uploadTokenId;
                var findData;

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
                                var newValue = parseInt(e.loaded / e.total * 10000) / 100;
                                $("#pvalue").html(parseInt(newValue));
                            }, false);
                        }
                        return XHR;
                    }
                };

                var serviceURL = serverHost + "/api_v3/service/media/action/upload";

                $("#modal_content").append("Uploading a media file ...<br>");

                $("#modal_content").append("<p>Progress: <span id=\"pvalue\" style=\"color:#00b200\">0.00</span> %</p>");

                // Transmits data.
                $.ajax(
                    serviceURL, postData
                )
                .done(function( xmlData, textStatus, xhr) {
                    // Response is not XML.
                    if (xmlData === null) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
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

                    var backendHost = xhr.getResponseHeader("X-Me");
                    if (backendHost !== null) {
                        if (serverHost.indexOf("https") === 0) {
                            serverHost = "https://" + backendHost;
                        }
                        else if (serverHost.indexOf("http") === 0){
                            serverHost = "http://" + backendHost;
                        }
                    }

                    // Entry metadata.
                    setTimeout(function() {
                        uploadAttributes(serverHost, ks, uploadTokenId);
                    }, 1000);
                })
                .fail(function(xmlData) {
                    deleteUploadToken(serverHost, ks, uploadTokenId);
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    printErrorMessage("Cannot upload the file !<br>(Cannot connect to contents server.)");

                });
            }

            /**
             * This function uploads metadata.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             * @param {string} uploadTokenId - upload token id.
             */
            function uploadAttributes(serverHost, ks, uploadTokenId) {

                var findData;
                var entryStatus;
                var entryId = "";
                var entryName = "";
                var entryTags = "";
                var entryDescription = "";
                var entryCreatorId = "";
                var type = $("#type").val();
                var mediaType = "";

                if (type == "image") {
                    mediaType = MEDIA_TYPE.IMAGE;
                } else if (type == "audio") {
                    mediaType = MEDIA_TYPE.AUDIO;
                } else {
                    mediaType = MEDIA_TYPE.VIDEO;
                }

                var nameStr = $("#name").val();
                var tagsStr = $("#tags").val();
                var descStr = $("#description").val();
                var controlId = $("#controlId").val();

                nameStr = nameStr.trim();
                tagsStr = tagsStr.trim();
                if (descStr !== null) {
                    descStr = descStr.trim();
                }

                // Creates form data.
                var fd = new FormData();
                fd.append("action", "addFromUploadedFile");
                fd.append("ks", ks);
                fd.append("uploadTokenId", uploadTokenId);
                fd.append("mediaEntry:name", nameStr);
                fd.append("mediaEntry:tags", tagsStr);
                if (descStr !== null && descStr !== "") {
                    fd.append("mediaEntry:description", descStr);
                } else {
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

                var serviceURL = serverHost + "/api_v3/service/media/action/addFromUploadedFile";

                // Transmits data.
                $.ajax (
                    serviceURL, postData
                )
                .done(function(xmlData){
                    // Response is not XML.
                    if (xmlData === null || typeof xmlData === undefined) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot upload the attribute information !<br>(Cannot get a XML response.)");
                        return;
                    }

                    // Get a tag of error code.
                    findData = $(xmlData).find("code");
                    // There exists error code.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot upload the attribute information !<br>(" + findData.text() + ")");
                        return;
                    }

                    // Get a tag of status.
                    findData = $(xmlData).find("status");
                    // There not exists a tag of status.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot upload the attribute information !<br>(Cannot get a mediaEntryStatus.)");
                        return;
                    }

                    // Get a value of status.
                    entryStatus = findData.text();
                    // When uploading of metadata failed.
                    if (entryStatus != STATUS.ENTRY_READY && entryStatus != STATUS.ENTRY_PENDING &&
                        entryStatus != STATUS.ENTRY_PRECONVERT) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot upload the attribute information !<br>(mediaEntryStatus: " + entryStatus + ")");
                        return;
                    }

                    // Get a tag of entry id.
                    findData = $(xmlData).find("id");
                    // Get a value of entry id.
                    entryId = findData.text();
                    // Get a tag of name.
                    findData = $(xmlData).find("name");
                    // Get a value of name.
                    entryName = findData.text();
                    // Get a tag of tags.
                    findData = $(xmlData).find("tags");
                    // Get a value of tags.
                    entryTags = findData.text();
                    // Get a tag of description.
                    findData = $(xmlData).find("description");
                    // There exists description.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        // Get a value of description.
                        entryDescription = findData.text();
                    } else {
                        entryDescription = "";
                    }
                    // Get a tago of creator id.
                    findData = $(xmlData).find("creatorId");
                    // Get a value of creator id.
                    entryCreatorId = findData.text();

                    // Prints back button.
                    addBackButton();
                    // Prints success message.
                    printSuccessMessage(entryId, entryName, entryTags, entryDescription, entryCreatorId);
                })
                .fail(function(xmlData){
                    deleteUploadToken(serverHost, ks, uploadTokenId);
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    printErrorMessage("Cannot upload the attribute information !<br>(Cannot connect to contents server.)");
                    return;
                });
            }

            /**
             * This function is callback for selection of media file.
             * @access public
             * @param {file[]} files - array of file object.
             */
            function handleFileSelect() {
                var files = $("#fileData");

                // There exists selected file.
                if ($("#fileData")) {
                    // Get an object of selected file.
                    var file = $("#fileData").prop("files")[0];

                    fileSize = parseInt(encodeURI(file.size));
                    var typeResult = checkFileType(encodeURI(file.type));
                    var sizeResult = checkFileSize();
                    var alertInfo = "";

                    // When file size is wrong.
                    if (sizeResult === false) {
                        alertInfo += "Wrong file size.";
                    }
                    // When file is no supported.
                    if (typeResult == "N/A") {
                        alertInfo += "Unsupported file type.";
                    }

                    // When any warning occures.
                    if (alertInfo !== "") {
                        window.alert(alertInfo);
                        $("#file_info").html("");
                        $("#name").val("");
                        $("#tags").val("");
                        $("#description").val("");
                        $("#type").val("");
                        files = null;
                    } else {  // When any warning do not occures.
                        var fileInfo = "";
                        var filename = file.name;
                        var sizeStr = "";

                        if (fileSize > 1024 * 1024 * 1024) {  // When file size exceeds 1GB.
                            fileSize = fileSize / (1024 * 1024 * 1024);
                            sizeStr = fileSize.toFixed(2) + " G";
                        } else if (fileSize > 1024 * 1024) {  // When file size exceeds 1MB.
                            fileSize = fileSize / (1024 * 1024);
                            sizeStr = fileSize.toFixed(2) + " M";
                        } else if (fileSize > 1024) {  // When file size exceeds 1kB.
                            fileSize = fileSize / 1024;
                            sizeStr = fileSize.toFixed(2) + " k";
                        } else {  // When file size under 1kB.
                            sizeStr = fileSize + " ";
                        }

                        fileInfo += "<div id=metadata_fields>";
                        fileInfo += "Size: " + sizeStr + "bytes<br>";
                        fileInfo += "MIME Type: " + encodeURI(file.type) + "<br>";
                        fileInfo += "</div><hr>";

                        $("#file_info").html(fileInfo);
                        $("#name").val(filename);
                        $("#type").val(typeResult);
                    }
                }

                checkForm();
            }

            /**
             * This function close kaltura session.
             * @access public
             */
            function sessionEnd() {
                var serverHost = $("#kalturahost").val(); // Get hostname of kaltura server.
                var serviceURL = serverHost + "/api_v3/service/session/action/end";

                // Transmits data.
                $.ajax({
                    type: "GET",
                    url: serviceURL,
                    cache: false
                })
                .done(function(xmlData) {
                    // Response is not XML.
                    if (xmlData === null) {
                        window.console.log("Cannot delete the uploadToken ! (Cannot get a XML response.)");
                    }
                    else {
                        window.console.log("Kaltura Session has been deleted.");
                    }
                })
                .fail(function(xmlData) {
                    window.console.log("Cannot delete the uploadToken ! (Cannot connect to contents server.)");
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                });
            }

            // This function execute when window is chagned.
            $(window).on("change", function(){
                checkForm();
            });

            // This function execute when window is uloaded.
            $(window).on("unload", function() {
                sessionEnd();
            });

            // This function execute when window is resized.
            $(window).resize(centeringModalSyncer);

            $("#fileData").on("change", function() {
                handleFileSelect();
            });

            $("#uploader_cancel").on("click", function() {
                handleCancelClick();
            });

            $("#name").on("change", function() {
                checkForm();
            });

            $("#tags").on("change", function() {
                checkForm();
            });

            $("#entry_submit").on("click", function() {
                handleSubmitClick();
            });

            $("#entry_reset").on("click", function() {
                handleResetClick();
            });

            // This function execute when this script is loaded.
            checkForm();

        }
    };
});
