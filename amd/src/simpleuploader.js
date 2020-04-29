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
 * @copyright  (C) 2016-2020 Yamaguchi University (gh-cc@mlex.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module local_yumymedia/simpleuploader
 */

define(['jquery'], function($) {

    return {
        /**
         * Initial function.
         * @access public
         */
        init: function() {

            var modalX = 0;
            var modalY = 0;

            var fileName = "";
            var fileSize = 0;

            var MEDIA_TYPE = {
                VIDEO: 1,
                IMAGE: 2,
                AUDIO: 5
            };

            var AUTO_FINALIZE = {
                TRUE: 1,
                FALSE: 0,
                NULL: -1
            };

            var ENTRY_STATUS = {
                ENTRY_IMPORTING: -2,
                ENTRY_CONVERTING: -1,
                ENTRY_IMPORT: 0,
                ENTRY_PRECONVERT: 1,
                ENTRY_READY: 2,
                ENTRY_DELETED: 3,
                ENTRY_PENDING: 4,
                ENTRY_MODERATE: 5,
                ENTRY_BLOCKED: 6,
                ENTRY_NO_CONTENT: 7
            };

            var UPLOAD_TOKEN_STATUS = {
                PENDING: 0,
                PARTIAL_UPLOAD: 1,
                FULL_UPLOAD: 2,
                CLOSED: 3,
                TIMED_OUT: 4,
                DELETED: 5
            };

            /**
             * This function centerizes a modal window.
             */
            function centeringModalSyncer() {

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
                if (fileType.indexOf("video/avi") != -1 || fileType.indexOf("video/x-msvideo") != -1 ||
                    fileType.indexOf("video/mpeg") != -1 || fileType.indexOf("video/mpg") != -1 ||
                    fileType.indexOf("video/mp4") != -1 || fileType.indexOf("video/ogg") != -1 ||
                    fileType.indexOf("video/quicktime") != -1 || fileType.indexOf("video/VP8") != -1 ||
                    fileType.indexOf("video/x-flv") != -1 || fileType.indexOf("video/x-f4v") != -1 ||
                    fileType.indexOf("video/x-matroska") != -1 ||
                    fileType.indexOf("video/x-ms-wmv") != -1 || fileType.indexOf("video/webm") != -1) {
                    return "video";
                }

                if (fileType.indexOf("audio/ac3") != -1 || fileType.indexOf("audio/ogg") != -1 ||
                    fileType.indexOf("audio/mpeg") != -1 || fileType.indexOf("audio/mp4") != -1 ||
                    fileType.indexOf("audio/mp3") != -1 ||
                    fileType.indexOf("audio/wav") != -1 || fileType.indexOf("audio/x-ms-wma") != -1) {
                    return "audio";
                }

                if (fileType.indexOf("image/gif") != -1 || fileType.indexOf("image/jpeg") != -1 ||
                    fileType.indexOf("image/png") != -1 || fileType.indexOf("image/tiff") != -1) {
                    return "image";
                }

                return "N/A";
            }

            /**
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
                } else {
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
                modalX = dElm.scrollLeft || dBody.scrollLeft; // X position.
                modalY = dElm.scrollTop || dBody.scrollTop; // Y position.
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
                window.scrollTo(modalX, modalY);
                // Fade-out [#modal_content] and [#modal_window].
                $("#modal_content,#modal_window").fadeOut("slow", function() {
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
                require(['core/str'], function(str) {
                    var message = str.get_string('back_label', 'local_yumymedia', null);
                    $.when(message).done(function(localizedString) {
                        var contentHtml = "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"";
                        contentHtml += localizedString + "\" />";
                        $("#modal_content").append(contentHtml);

                        $("#backToMymedia").on("click", function() {
                            handleCancelClick();
                        });
                    });
                });
            }

            /**
             * This function prints error message.
             * @access public
             * @param {string} errorMessage - string of error message.
             * @param {string} ks - session string of kaltura connecion;
             * @param {string} uploadTokenId - upload token id.
             */
            function printErrorMessage(errorMessage, ks, uploadTokenId) {
                if (ks !== "" && uploadTokenId !== "") {
                    deleteUploadToken();
                }
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

                require(['core/str', 'core/notification'], function(str, notification) {
                    var strings = [
                        {key: 'upload_success', component: 'local_yumymedia'},
                        {key: 'entryid_header', component: 'local_yumymedia'},
                        {key: 'name_header', component: 'local_yumymedia'},
                        {key: 'tags_header', component: 'local_yumymedia'},
                        {key: 'desc_header', component: 'local_yumymedia'},
                        {key: 'creatorid_header', component: 'local_yumymedia'},
                        {key: 'back_label', component: 'local_yumymedia'}
                    ];
                    str.get_strings(strings).then(function(results) {
                        // Delete modal window.
                        fadeOutModalWindow();

                        var output = '<h3>' + results[0] + '</h3>';
                        output += "<table border=\"2\" cellpadding=\"5\">";
                        output += "<tr><td>" + results[1] + "</td><td>" + id + "</td></tr>";
                        output += "<tr><td>" + results[2] + "</td><td>" + name + "</td></tr>";
                        output += "<tr><td>" + results[3] + "</td><td>" + tags + "</td></tr>";
                        output += "<tr><td>" + results[4] + "</td><td>" + description + "</td></tr>";
                        output += "<tr><td>" + results[5] + "</td><td>" + creatorId + "</td></tr>";
                        output += "</table>";
                        output += "<br>";
                        output += "<input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"";
                        output += results[6] + "\" />";
                        $("#upload_info").html(output);
                        $("#backToMymedia").on("click", function() {
                            handleCancelClick();
                        });
                        return 0;
                    }).fail(notification.exception);
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
                var regex = /["$%&'~^\\`/]/;
                if (regex.test(str) === true) {
                    return false;
                } else {
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
                var regex = /[!"#$%&'~|^\\@`()[\]{}:;+*/=<>?]/;
                if (regex.test(str) === true) {
                    return false;
                } else {
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

                var flag = true;

                if (checkNameString(nameStr) === false) {
                    require(['core/str'], function(str) {
                        var message = str.get_string('wrong_name', 'local_yumymedia', null);
                        $.when(message).done(function(localizedString) {
                            window.alert(localizedString);
                        });
                    });
                    flag = false;
                }

                if (checkTagsString(tagsStr) === false) {
                    require(['core/str'], function(str) {
                        var message = str.get_string('wrong_tags', 'local_yumymedia', null);
                        $.when(message).done(function(localizedString) {
                            window.alert(localizedString);
                        });
                    });
                    flag = false;
                }

                if (checkNameString(descStr) === false) {
                    require(['core/str'], function(str) {
                        var message = str.get_string('wrong_desc', 'local_yumymedia', null);
                        $.when(message).done(function(localizedString) {
                            window.alert(localizedString);
                        });
                    });
                    flag = false;
                }

                return flag;
            }

            /**
             * This function is callback for submit button.
             * @access public
             * @return {bool} - if file is uploaded, return true. Otherwise, return false.
             */
            function handleSubmitClick() {
                var flag = true;

                if (checkMetadata() === false) {
                    flag = false;
                } else if (checkFileSize() === false) {
                    require(['core/str'], function(str) {
                        var message = str.get_string('wrong_filesize', 'local_yumymedia', null);
                        $.when(message).done(function(localizedString) {
                            window.alert(localizedString);
                        });
                    });
                    flag = false;
                } else {
                    $("#entry_submit").prop("disabled", true);
                    fadeInModalWindow(); // Prints modal window.
                    executeUploadProcess(); // Executes upload.
                    flag = true;
                }

                return flag;
            }

            /**
             * This function executes upload process.
             * @access public
             */
            function executeUploadProcess() {
                var serverHost = $("#kalturahost").val(); // Get hostname of kaltura server.
                var ks = $("#ks").val(); // Get session id.
                // Create upload token.
                createUploadToken(serverHost, ks);
            }

            /**
             * This function deletes upload token.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             * @param {string} uploadTokenId - token id for uploading.
             * @return {bool} if upload token is deleted, return true.
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
                $.ajax(
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
             * This function creates upload token.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             */
            function createUploadToken(serverHost, ks) {
                var uploadTokenId;
                var findData;

                var file = $("#fileData").prop("files")[0];

                fileSize = parseInt(encodeURI(file.size));

                var postData = {
                    type: "GET",
                    cache: false,
                    async: true,
                    contentType: false,
                    scriptCharset: "utf-8",
                    dataType: "xml"
                };

                var serviceURL = serverHost + "/api_v3/service/uploadToken/action/add?ks=" + ks;
                serviceURL = serviceURL + "&uploadToken:objectType=KalturaUploadToken";
                serviceURL = serviceURL + "uploadToken:fileName=" + encodeURI(fileName);
                serviceURL = serviceURL + "&uploadToken:fileSize=" + fileSize;
                serviceURL = serviceURL + "&uploadToken:autoFinalize=" + AUTO_FINALIZE.NULL;

                // Transmits data.
                $.ajax(
                    serviceURL, postData
                )
                .done(function(xmlData) {
                    // Response is not XML.
                    if (xmlData === null) {
                        printErrorMessage("Cannot create upload token !<br>(Cannot get a XML response.)");
                        return;
                    }

                    // Get a tag of error code.
                    findData = $(xmlData).find("code");
                    // There exists error code.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        printErrorMessage("Cannot create upload token !<br>(" + findData.text() + ")");
                        return;
                    }

                    findData = $(xmlData).find("status");
                    // There not exists upload token id.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        printErrorMessage("Cannot create upload token !<br>(Cannot get status of upload token.)");
                        return;
                    }

                    var uploadTokenStatus = findData.text();
                    if (uploadTokenStatus != UPLOAD_TOKEN_STATUS.PENDING) {
                        printErrorMessage("Cannot create upload token !<br>(UPLOAD_TOKEN_STATUS : " + uploadTokenStatus + ")");
                        return;
                    }
                    // Get upload token id.
                    findData = $(xmlData).find("id");
                    // There not exists upload token id.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        printErrorMessage("Cannot create uplaod token !<br>(Cannot get an uploadTokenId.)");
                        return;
                    }
                    uploadTokenId = findData.text();
                    // Entry metadata.
                    setTimeout(function() {
                        createMediaEntry(serverHost, ks, uploadTokenId);
                    }, 1000);

                })
                .fail(function(xmlData) {
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    printErrorMessage("Cannot create upload token !<br>(Cannot connect to kaltura server.)");
                });
            }

            /**
             * This function creates media entry.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connecion;
             * @param {string} uploadTokenId - upload token id.
             */
            function createMediaEntry(serverHost, ks, uploadTokenId) {
                var findData;
                var entryStatus;
                var entryId = "";
                var entryName = "";
                var entryTags = "";
                var entryDescription = "";
                var entryCreatorId = "";

                var nameStr = $("#name").val();
                var tagsStr = $("#tags").val();
                var descStr = $("#description").val();
                var controlId = $("#controlId").val();
                var creatorId = $("#creatorId").val();

                nameStr = nameStr.trim();
                tagsStr = tagsStr.trim();
                if (descStr !== null) {
                    descStr = descStr.trim();
                }

                var fd = new FormData();

                // Creates form data.
                fd.append("action", "add");
                fd.append("ks", ks);
                fd.append("entry:objectType", "KalturaMediaEntry");

                var type = $("#type").val();
                var mediaType = "";

                if (type == "image") {
                    mediaType = MEDIA_TYPE.IMAGE;
                } else if (type == "audio") {
                    mediaType = MEDIA_TYPE.AUDIO;
                } else {
                    mediaType = MEDIA_TYPE.VIDEO;
                }

                fd.append("entry:mediaType", mediaType);
                fd.append("entry:sourceType", 1);
                fd.append("entry:name", nameStr);
                fd.append("entry:tags", tagsStr);
                if (descStr !== null && descStr !== "") {
                    fd.append("entry:description", descStr);
                } else {
                    fd.append("entry:description", "");
                }

                fd.append("entry:categories", $("#categories").val());

                if (controlId !== null && controlId !== "") {
                    fd.append("entry:accessControlId", controlId);
                }

                fd.append("entry:creatorId", creatorId);
                fd.append("entry:userId", creatorId);

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

                var serviceURL = serverHost + "/api_v3/service/media/action/add";

                // Transmits data.
                $.ajax(
                    serviceURL, postData
                )
                .done(function(xmlData) {
                    // Response is not XML.
                    if (xmlData === null || typeof xmlData === undefined) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot create media entry !<br>(Cannot get a XML response.)");
                        return;
                    }

                    // Get a tag of error code.
                    findData = $(xmlData).find("code");
                    // There exists an error code.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot create media entry !<br>(" + findData.text() + ")");
                        return;
                    }

                    // Get a tag of status.
                    findData = $(xmlData).find("status");
                    // There not exists a tag of status.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot create media entyry !<br>(Cannot get a mediaEntryStatus.)");
                        return;
                    }

                    // Get a value of status.
                    entryStatus = findData.text();
                    // When uploading of metadata failed.
                    if (entryStatus != ENTRY_STATUS.ENTRY_NO_CONTENT) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot create media entry!<br>(mediaEntryStatus: " + entryStatus + ")");
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

                    if (entryId === null || entryId === "" || entryName === null || entryName === "" ||
                        entryTags === null || entryTags === "" || entryCreatorId === null || entryCreatorId === "" ||
                        descStr !== "" && (entryDescription === null || entryDescription === "")) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("There exists wrong information(s) <br>");
                        return;
                    }

                    // Associate uploaded file with media entry.
                    setTimeout(function() {
                        uploadMediaFile(serverHost, ks, uploadTokenId, entryId);
                    }, 1000);

                })
                .fail(function(xmlData) {
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    deleteUploadToken(serverHost, ks, uploadTokenId);
                    printErrorMessage("Cannot create media entry !<br>(Cannot connect to kaltura server.)");
                    return;
                });
            }

            /**
             * This function uploads media file.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             * @param {string} uploadTokenId - upload token id.
             * @param {string} entryId - id of media entry.
             */
            function uploadMediaFile(serverHost, ks, uploadTokenId, entryId) {
                var findData;
                var fd = new FormData();

                require(['core/str', 'core/notification'], function(str, notification) {
                    var strings = [
                        {key: 'uploader_uploading', component: 'local_yumymedia'},
                        {key: 'progress', component: 'local_yumymedia'},
                        {key: 'attach_file', component: 'local_yumymedia'}
                    ];
                    str.get_strings(strings).then(function(results) {
                        $("#modal_content").append(results[0] + "<br>");
                        var message = "<p>" + results[1];
                        message = message + ": <span id=\"pvalue\" style=\"color:#00b200\">0.00</span> %</p>";
                        $("#modal_content").append(message);
                        // Creates form data.
                        fd.append("action", "upload");
                        fd.append("ks", ks);
                        fd.append("uploadTokenId", uploadTokenId);
                        fd.append("fileData", $("input[name='fileData']").prop("files")[0], encodeURI(fileName), fileSize);
                        fd.append("resume", false);
                        fd.append("finalChunk", true);
                        fd.append("resumeAt", 0);

                        // Creates tnramission data.
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
                                if (XHR.upload) {
                                    XHR.upload.addEventListener("progress", function(e) {
                                        var newValue = parseInt(parseInt(e.loaded) / parseInt(e.total) * 10000) / 100;
                                        $("#pvalue").html(parseInt(newValue));
                                    }, false);
                                }
                                return XHR;
                            }
                        };

                        var serviceURL = serverHost + "/api_v3/service/uploadToken/action/upload";

                        // Transmits data.
                        $.ajax(
                            serviceURL, postData
                        )
                        .done(function(xmlData) {
                            // Response is not XML.
                            if (xmlData === null) {
                                deleteUploadToken(serverHost, ks, uploadTokenId);
                                printErrorMessage("Cannot upload the video !<br>(Cannot get a XML response.)");
                                return;
                            }

                            // Get a tag of error code.
                            findData = $(xmlData).find("code");
                            // There exists error code.
                            if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                                deleteUploadToken(serverHost, ks, uploadTokenId);
                                printErrorMessage("Cannot upload the video !<br>(" + findData.text() + ")");
                                return;
                            }

                            // Get upload token id.
                            findData = $(xmlData).find("status");
                            // There not exists upload token id.
                            if (findData === null || typeof findData === undefined || findData.text() === "") {
                                deleteUploadToken(serverHost, ks, uploadTokenId);
                                printErrorMessage("Cannot upload the video !<br>(Cannot get an uploadTokenStatus.)");
                                return;
                            }

                            var uploadTokenStatus = findData.text();
                            if (uploadTokenStatus != UPLOAD_TOKEN_STATUS.FULL_UPLOAD &&
                                uploadTokenStatus != UPLOAD_TOKEN_STATUS.PARTIAL_UPLOAD) {
                                deleteUploadToken(serverHost, ks, uploadTokenId);
                                printErrorMessage("Cannot upload the video !<br>(UPLOAD_TOKEN_STATUS : " + uploadTokenStatus + ")");
                                return;
                            } else {
                                window.console.log("File chunk have been transmitted.");
                            }

                            $("#modal_content").append(results[2] + "<br>");

                            // Create media entry.
                            setTimeout(function() {
                                attachUploadedFile(serverHost, ks, uploadTokenId, entryId);
                            }, 1000);

                        })
                        .fail(function(xmlData) {
                            if (xmlData !== null) {
                                window.console.dir(xmlData);
                            }
                            deleteUploadToken(serverHost, ks, uploadTokenId);
                            printErrorMessage("Cannot upload the file !<br>(Cannot connect to contents server.)");
                            return;
                        });
                        return 0;
                    }).fail(notification.exception);
                });
            }

            /**
             * This function uploads metadata.
             * @access public
             * @param {string} serverHost - hostname of kaltura server.
             * @param {string} ks - session string of kaltura connection.
             * @param {string} uploadTokenId - upload token id.
             * @param {string} entryId - id of media entry.
             */
            function attachUploadedFile(serverHost, ks, uploadTokenId, entryId) {
                var entryStatus;
                var entryName = "";
                var entryTags = "";
                var entryDescription = "";
                var entryCreatorId = "";

                var findData;

                // Creates form data.
                var fd = new FormData();
                fd.append("action", "addContent");
                fd.append("ks", ks);
                fd.append("entryId", entryId);
                fd.append("resource:objectType", "KalturaUploadedFileTokenResource");
                fd.append("resource:token", uploadTokenId);

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

                var serviceURL = serverHost + "/api_v3/service/media/action/addContent";

                // Transmits data.
                $.ajax(
                    serviceURL, postData
                )
                .done(function(xmlData) {
                    // Response is not XML.
                    if (xmlData === null || typeof xmlData === undefined) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot attach uploaded file !<br>(Cannot get a XML response.)");
                        return;
                    }

                    // Get a tag of error code.
                    findData = $(xmlData).find("code");
                    // There exists error code.
                    if (findData !== null && typeof findData !== undefined && findData.text() !== "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot attach uploaded file !<br>(" + findData.text() + ")");
                        return;
                    }

                    // Get a tag of status.
                    findData = $(xmlData).find("status");
                    // There not exists a tag of status.
                    if (findData === null || typeof findData === undefined || findData.text() === "") {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot attach uploaded file !<br>(Cannot get a mediaEntryStatus.)");
                        return;
                    }

                    // Get a value of status.
                    entryStatus = findData.text();
                    // When uploading of metadata failed.
                    if (entryStatus != ENTRY_STATUS.ENTRY_READY && entryStatus != ENTRY_STATUS.ENTRY_PENDING &&
                        entryStatus != ENTRY_STATUS.ENTRY_PRECONVERT && entryStatus != ENTRY_STATUS.IMPORT &&
                        entryStatus != ENTRY_STATUS.IMPORTING) {
                        deleteUploadToken(serverHost, ks, uploadTokenId);
                        printErrorMessage("Cannot attach uploaded file !<br>(mediaEntryStatus: " + entryStatus + ")");
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
                .fail(function(xmlData) {
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                    deleteUploadToken(serverHost, ks, uploadTokenId);
                    printErrorMessage("Cannot attach uploaded file !<br>(Cannot connect to kaltura server.)");
                    return;
                });
            }

            /**
             * This function is callback for selection of media file.
             * @access public
             */
            function handleFileSelect() {

                var alertInfo = '';

                // There exists selected file.
                if ($("#fileData")) {
                    // Get an object of selected file.
                    var file = $("#fileData").prop("files")[0];

                    fileSize = parseInt(file.size);
                    var typeResult = checkFileType(encodeURI(file.type));
                    var sizeResult = checkFileSize();

                    require(['core/str', 'core/notification'], function(str, notification) {
                        var strings = [
                            {key: 'wrong_filesize', component: 'local_yumymedia'},
                            {key: 'unsupported_filetype', component: 'local_yumymedia'},
                            {key: 'filesize', component: 'local_yumymedia'},
                            {key: 'mimetype', component: 'local_yumymedia'}
                        ];
                        str.get_strings(strings).then(function(results) {
                            // When file size is wrong.
                            if (sizeResult === false) {
                                alertInfo += results[0];
                            }
                            // When file is no supported.
                            if (typeResult == "N/A") {
                                alertInfo += results[1];
                            }

                            // When any warning occures.
                            if (alertInfo !== "") {
                                window.alert(alertInfo);
                                $("#file_info").html("");
                                $("#name").val("");
                                $("#tags").val("");
                                $("#description").val("");
                                $("#type").val("");
                                $("#fileData").val("");
                            } else { // When any warning do not occures.
                                var fileInfo = "";
                                var sizeStr = "";
                                var dividedSize = 0;

                                fileName = file.name;

                                if (fileSize > 1024 * 1024 * 1024) { // When file size exceeds 1GB.
                                    dividedSize = fileSize / (1024 * 1024 * 1024);
                                    sizeStr = dividedSize.toFixed(2) + " G";
                                } else if (fileSize > 1024 * 1024) { // When file size exceeds 1MB.
                                    dividedSize = fileSize / (1024 * 1024);
                                    sizeStr = dividedSize.toFixed(2) + " M";
                                } else if (fileSize > 1024) { // When file size exceeds 1kB.
                                    dividedSize = fileSize / 1024;
                                    sizeStr = dividedSize.toFixed(2) + " k";
                                } else { // When file size under 1kB.
                                    sizeStr = fileSize + " ";
                                }

                                fileInfo += "<div id=metadata_fields>";
                                fileInfo += results[2] + ": " + sizeStr + "bytes<br>";
                                fileInfo += results[3] + ":" + encodeURI(file.type) + "<br>";
                                fileInfo += "</div><hr>";

                                $("#file_info").html(fileInfo);
                                $("#name").val(fileName);
                                $("#type").val(typeResult);
                            }
                            return 0;
                        }).fail(notification.exception);
                    });
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
                    } else {
                        window.console.log("Kaltura Session has been deleted.");
                    }
                })
                .fail(function(xmlData) {
                    window.console.log("Cannot delete the uploadToken ! (Cannot connect to content server.)");
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                });
            }

            // This function execute when window is chagned.
            $(window).on("change", function() {
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
