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
 * Recorder Script used in resource and activirty modules.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2019 Yamaguchi University (gh-cc@mlex.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module local_yumymedia/modulerecorder
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
            var timer = false;

            var fileSize = 0;
            var sizeResult = false;
            var fileType = "";

            var defaultWidth = 400;
            var defaultHeight = 300;

            var localStream = null;
            var videoBlob = null;
            var videoFilename = "";
            var blobUrl = null;
            var recorder = null;
            var constraints = null;

            var createObjectURL = window.URL && window.URL.createObjectURL
                    ? function(file) {
                        return window.URL.createObjectURL(file);
                    }
                    : window.webkitURL && window.webkitURL.createObjectURL
                        ? function(file) {
                            return window.webkitURL.createObjectURL(file);
                        }
                        : undefined;

            var revokeObjectURL = window.URL && window.URL.revokeObjectURL
                    ? function(file) {
                        return window.URL.revokeObjectURL(file);
                    }
                    : window.webkitURL && window.webkitURL.revokeObjectURL
                        ? function(file) {
                            return window.webkitURL.revokeObjectURL(file);
                        }
                        : undefined;

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
             * This function retrieve whether web browser is the Internet Explorer.
             * @access public
             * @return {bool} - true if web browser is the IE, otherwise false.
             */
            function isIE() {
                var ua = navigator.userAgent.toLowerCase();
                var ver = navigator.appVersion.toLowerCase();

                // Case of IE(not 11).
                var isMsIE = (ua.indexOf('msie') > -1) && (ua.indexOf('opera') == -1);
                // Case of IE6.
                var isIE6 = isMsIE && (ver.indexOf('msie 6.') > -1);
                // Case of IE7.
                var isIE7 = isMsIE && (ver.indexOf('msie 7.') > -1);
                // Cae of IE8.
                var isIE8 = isMsIE && (ver.indexOf('msie 8.') > -1);
                // Case of IE9.
                var isIE9 = isMsIE && (ver.indexOf('msie 9.') > -1);
                // Case of IE10.
                var isIE10 = isMsIE && (ver.indexOf('msie 10.') > -1);
                // Case of IE11.
                var isIE11 = (ua.indexOf('trident/7') > -1);

                return isMsIE || isIE6 || isIE7 || isIE8 || isIE9 || isIE10 || isIE11;
            }

            /**
             * This function retrieve whether we browser is the Edge.
             * @access public
             * @return {bool} - true if web browser is the Edge, otherwise false.
             */
            function isEdge() {
                var ua = navigator.userAgent.toLowerCase();

                // Case of Edge.
                var isMsEdge = (ua.indexOf('edge') > -1);
                // Case of Google Chrome.
                var isChrome = (ua.indexOf('chrome') > -1) && (ua.indexOf('edge') == -1);
                // Case of Moziila Firefox.
                var isFirefox = (ua.indexOf('firefox') > -1);
                // Case of Safari.
                var isSafari = (ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1);
                // Case of Opera.
                var isOpera = (ua.indexOf('opera') > -1);

                return isMsEdge === true && isChrome === false && isFirefox === false && isSafari === false && isOpera === false;
            }

            /**
             * This function retrieve whether web browser is unsupported.
             * @access public
             * @return {bool} - true if web browser is unsupported, otherwise false.
             */
            function checkUnsupportedBrowser() {
                var str = "";

                if (isIE() || isEdge()) {
                    var browser = "";
                    if (isIE()) {
                        browser = "Internet Explorer";
                    } else {
                        browser = "Edge";
                    }

                    str = "<p><font color=\"red\">Sorry!!<br>";
                    str = str + "This uploader don't support your web browser (" + browser + ").<br>";
                    str = str + "Please use other browser.</font></p>";
                    str = str + "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";
                    $("#upload_info").html(str);

                    $("#backToMymedia").on("click", function() {
                        fadeOutRecorderWindow();
                    });

                    return true;
                }
                return false;
            }

            /**
             * This function retrieve os type.
             * @return {string} - os type.
             */
            function getOperatingSystem() {
                var os;
                var ua = navigator.userAgent;

                if (ua.match(/iPhone|iPad|iPod/)) {
                    os = "iOS";
                } else if (ua.match(/Android|android/)) {
                    os = "Android";
                } else if (ua.match(/Linux|linux/)) {
                    os = "Linux";
                } else if (ua.match(/Win(dows)/)) {
                    os = "Windows";
                } else if (ua.match(/Mac|PPC/)) {
                    os = "Mac OS";
                } else if (ua.match(/CrOS/)) {
                    os = "Chrome OS";
                } else {
                    os = "Other";
                }

                return os;
            }

            /**
             * This function retrieve whether os is unsupported.
             * @access public
             * @return {bool} - true if os is unsupported, otherwise false.
             */
            function checkUnsupportedOS() {
                var str = "";

                var os = getOperatingSystem();

                if (os == "iOS" || os == "Android") {
                    str = "<p><font color=\"red\">Sorry!!<br>";
                    str = str + "This uploader don't support your os (" + os + ").<br>";
                    str = str + "Please use normal media uploader for your device.</font></p>";
                    str = str + "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";
                    $("#upload_info").html(str);

                    $("#backToMymedia").on("click", function() {
                        fadeOutRecorderWindow();
                    });

                    return true;
                }
                return false;
            }

            /**
             * This function print initial error message.
             * @access public
             * @param {string} message - error message.
             */
            function printInitialErrorMessage(message) {
                var str = "";
                str = "<p><font color=\"red\">" + message + "</font></p>";
                str = str + "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";
                $("#upload_info").html(str);

                $("#backToMymedia").on("click", function() {
                    fadeOutRecorderWindow();
                });
            }

            /**
             * This function print a video player for playing.
             * @access public
             * @param {string} url - url of media.
             */
            function setPlayingPlayer(url) {
                var str = "<video id=\"webcam\" width=\"" + defaultWidth + "\" height=\"" + defaultHeight + "\" ";
                str = str + "src=\"" + url + "\" autoplay=\"false\" oncontextmenu=\"return false;\" controls></video>";
                $("#videospan").html(str);
                document.getElementById("webcam").pause();
                document.getElementById("webcam").currentTime = 0;
            }

            /**
             * This function print a video player for preview.
             * @access public
             * @param {string} url - url of media.
             */
            function setPreviewPlayer(url) {
                var str = "<video id=\"webcam\" width=\"" + defaultWidth + "\" height=\"" + defaultHeight + "\" ";
                str = str + "autoplay=\"0\" muted oncontextmenu=\"return false;\"></video>";
                $("#videospan").html(str);
                $("#webcam").attr("src", url);
            }

            /**
             * This function start video recording by webcamera.
             * @access public
             */
            function startRecording() {
                $("#recstop").attr("src", $("#stopurl").val());
                $("#recstop").off("click");

                $("#recstop").on("click", function() {
                    stopRecording();
                });

                $("#leftspan").css("display", "inline");
                $("#webcam").volume = 0.0;
                recorder.start();

                $("#status").html("<font color=\"red\">Now, recording...</font>");
            }

            /**
             * This function stop video recording.
             * @access public
             */
            function stopRecording() {
                recorder.ondataavailable = function(evt) {
                    videoBlob = new Blob([evt.data], {type: evt.data.type});
                    if (window.URL && window.URL.createObjectURL) {
                        blobUrl = window.URL.createObjectURL(videoBlob);
                    } else {
                        blobUrl = window.webkitURL.createObjectURL(videoBlob);
                    }
                    setPlayingPlayer(blobUrl);
                    fileSize = videoBlob.size;
                    var sizeStr = "";
                    var dividedSize = 0;

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

                    $("#status").html("<font color=\"green\">Video preview (" + videoBlob.type + ", " + sizeStr + "B).</font>");
                    fileType = checkFileType(videoBlob.type);
                    sizeResult = checkFileSize();
                    if (sizeResult === false) {
                        window.alert("Wrong file size.");
                    }

                    checkForm();
                    videoFilename = $("#filename").val() + "." + getFileExtension(videoBlob.type);
                };

                if (localStream.getTracks !== undefined && localStream.getTracks !== null) {
                    var tracks = localStream.getTracks();
                    for (var i = tracks.length - 1; i >= 0; --i) {
                        tracks[i].stop();
                    }
                    if (document.getElementById("webcam").srcObject !== undefined) {
                        document.getElementById("webcam").srcObject = null;
                    }
                }

                recorder.stop();

                $("#leftspan").css("display", "none");
                $("#rightspan").css("display", "inline");

                $("#remove").on("click", function() {
                    removeVideo();
                });
            }

            /**
             * This function remove recorded video.
             * @access public
             */
            function removeVideo() {
                var str = "";

                // Print error message and return true if web browser is unsupported.
                if (checkUnsupportedBrowser() || checkUnsupportedOS()) {
                    return;
                }

                navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
                    getUserMedia: function(c) {
                        return new Promise(function(y, n) {
                            (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
                        });
                    }
                } : null);

                try {
                    if (navigator.mediaDevices === null || navigator.mediaDevices === undefined ||
                        MediaRecorder === null || MediaRecorder === undefined) {
                        str = "This uploader requires the WebRTC.<br>";
                        str = str + "Howerver, your web browser don't support the WebRTC.<br>";
                        str = str + "Please use other browser.";
                        printInitialErrorMessage(str);
                        return;
                    }

                    if (createObjectURL === null || createObjectURL === undefined ||
                        revokeObjectURL === null || revokeObjectURL === undefined) {
                        str = "This uploader requires the createObjectURL/revokeObjectURL.<br>";
                        str = str + "Howerver, your web browser don't support these function.<br>";
                        str = str + "Please use other browser.";
                        printInitialErrorMessage(str);
                        return;
                    }
                } catch (err) {
                    str = "This uploader requires the WebRTC.<br>";
                    str = str + "Howerver, your web browser don't support the WebRTC.<br>";
                    str = str + "Please use other browser.";
                    printInitialErrorMessage(str);
                    window.console.log(err);
                    return;
                }

                setPreviewPlayer(null);

                if (blobUrl !== null) {
                    if (window.URL && window.URL.revokeObjectURL) {
                        window.URL.revokeObjectURL(blobUrl);
                    } else {
                        window.webkitURL.revokeObjectURL(blobUrl);
                    }
                    blobUrl = null;
                    videoBlob = null;
                }

                if (localStream !== null) {
                    if (localStream.getTracks !== undefined || localStream.getTracks !== null) {
                        var tracks = localStream.getTracks();
                        for (var i = tracks.length - 1; i >= 0; --i) {
                            tracks[i].stop();
                        }
                        if (document.getElementById("webcam").srcObject) {
                            document.getElementById("webcam").srcObject = null;
                        }

                    } else {
                        localStream.stop();
                    }
                }

                fileSize = 0;
                sizeResult = false;
                fileType = "";

                $("#recstop").off("click");
                $("#remove").off("click");
                $("#webcam").off("ondataavailable");

                var mimeOption = "";

                // Prefer camera resolution nearest to 1280x720.
                if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                    mimeOption = "video/webm; codecs=vp8";
                } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                    mimeOption = "video/webm; codecs=vp9";
                } else if (MediaRecorder.isTypeSupported("video/webm")) {
                    mimeOption = "video/webm";
                } else {
                    mimeOption = "video/mp4";
                }

                constraints = {
                    audioBitsPerSecond: 128000,
                    videoBitsPerSecond: 1500000,
                    mimeType: mimeOption,
                    audio: {
                        echoCancellation: false
                    },
                    video: {
                        "mandatory": {
                            minWidth: 320,
                            minHeight: 240,
                            maxWidth: 1280,
                            maxHeight: 720,
                            minFrameRate: 5,
                            maxFrameRate: 15
                        },
                        "optional": [{"facingMode": "user"}]
                    }
                };

                var p = navigator.mediaDevices.getUserMedia(constraints);

                p.then(function(stream) {
                    localStream = stream;
                    var video = document.getElementById("webcam");
                    if (video.srcObject !== undefined) {
                        video.srcObject = localStream;
                        video.play();
                    } else {
                        if (window.URL && window.URL.createObjectURL) {
                            blobUrl = window.URL.createObjectURL(blobUrl);
                        } else {
                            blobUrl = window.webkitURL.createObjectURL(blobUrl);
                        }
                        $("#webcam").attr("src", blobUrl);
                    }
                    window.console.log(localStream);
                    recorder = new MediaRecorder(localStream, constraints);
                    $("#recstop").attr("src", $("#recurl").val());
                    $("#recstop").on("click", function() {
                        startRecording();
                    });
                    $("#leftspan").css("display", "inline");
                    $("#rightspan").css("display", "none");
                    $("#status").html("Camera preview.");
                })
                .catch(function(err) {
                    var str = "Your webcamera is not supported, ";
                    str = str + "or it is already used.<br>";
                    str = str += "Please check your webcamera.";
                    printInitialErrorMessage(str);
                    window.console.log(err);
                    return;
                });

                checkForm();
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
                    fileType.indexOf("video/mp4") != -1 || fileType.indexOf("video/ogg") ||
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
             * This function return file extension string.
             * @access public
             * @param {string} fileType - file type of selected media.
             * @return {string} - file extension of selected media.
             */
            function getFileExtension(fileType) {
                if (fileType.indexOf("video/avi") != -1 || fileType.indexOf("video/x-msvideo") != -1) {
                    return "avi";
                }
                if (fileType.indexOf("video/mpeg") != -1 || fileType.indexOf("video/mpg") != -1 ||
                    fileType.indexOf("audio/mpeg") != -1 || fileType.indexOf("audio/mpg") != -1) {
                    return "mpeg";
                }
                if (fileType.indexOf("video/mp4") != -1 || fileType.indexOf("video/m4v") != -1 ||
                    fileType.indexOf("audio/mp4") != -1) {
                    return "mp4";
                }
                if (fileType.indexOf("video/ogg") != -1) {
                    return "ogg";
                }
                if (fileType.indexOf("video/quicktime") != -1) {
                    return "mov";
                }
                if (fileType.indexOf("video/VP8") != -1 || fileType.indexOf("video/VP9") != -1 ||
                    fileType.indexOf("video/vp8") != -1 || fileType.indexOf("video/vp9") != -1 ||
                    fileType.indexOf("video/webm") != -1) {
                    return "webm";
                }
                if (fileType.indexOf("video/x-flv") != -1 || fileType.indexOf("video/x-f4v") != -1) {
                    return "flv";
                }
                if (fileType.indexOf("video/x-matroska") != -1) {
                    return "mkv";
                }
                if (fileType.indexOf("video/x-ms-wmv") != -1) {
                    return "wmv";
                }

                if (fileType.indexOf("audio/ac3") != -1) {
                    return "ac3";
                }
                if (fileType.indexOf("audio/ogg") != -1) {
                    return "ogg";
                }
                if (fileType.indexOf("audio/wav") != -1) {
                    return "wav";
                }
                if (fileType.indexOf("audio/x-ms-wma") != -1) {
                    return "wma";
                }

                if (fileType.indexOf("image/gif") != -1) {
                    return "gif";
                }
                if (fileType.indexOf("image/jpeg") != -1) {
                    return "jpg";
                }
                if (fileType.indexOf("image/png") != -1) {
                    return "png";
                }
                if (fileType.indexOf("image/tiff") != -1) {
                    return "tiff";
                }

                return "webm";
            }

            /**
             * This function checks metadata.
             * @access public
             */
            function checkForm() {
                if (blobUrl === null ||
                    videoBlob === null ||
                    videoBlob.size === 0 ||
                    sizeResult === false ||
                    $("#name").val() === "" ||
                    $("#tags").val() === "" ||
                    fileType === "" ||
                    fileType === "N/A") {
                    // Dsiable upload button.
                    $("#entry_submit").prop("disabled", true);
                    $("#entry").val("");
                } else {
                    // Enable upload button.
                    $("#entry_submit").prop("disabled", false);
                }
            }

            /**
             * This function deletes a modal window.
             * @access public
             */
            function fadeOutRecorderWindow() {
                // Rescore scroll position of window.
                window.scrollTo(modalX, modalY);
                // Fade-out and delete modal contet and modal window.
                $("#modal_window", parent.document).fadeOut("slow");
                $("#modal_window", parent.document).remove();
                $("#uploader_content", parent.document).fadeOut("slow");
                $("#uploader_content", parent.document).remove();
            }

            /**
             * This function adds back button.
             * @access public
             */
            function addBackButton() {
                var contentHtml = "<br><input type=button id=\"backToMymedia\" name=\"backToMymedia\" value=\"Back\" />";
                $("#upload_info").append(contentHtml);

                $("#backToMymedia").on("click", function() {
                    fadeOutRecorderWindow();
                });

            }

            /**
             * This function prints error message.
             * @access public
             * @param {string} errorMessage - string of error message.
             */
            function printErrorMessage(errorMessage) {
                $("#upload_info").html("");
                $("#upload_info").append("<font color=\"red\">" + errorMessage + "</font><br>");
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
                    fadeOutRecorderWindow();
                });
            }

            /**
             * This function set module properties.
             * @access public
             * @param {string} serverHost - URI of server host.
             * @param {string} id - id of media entry.
             * @param {string} name - name of media entry.
             * @param {string} description - description of media entry.
             */
            function setModuleProperties(serverHost, id, name, description) {
                if (id !== null && id !== "") {
                    if (id !== null) {
                        $("#entry_id", parent.document).val(id);
                    }

                    var idName = $("#id_name", parent.document);

                    if (idName !== null) {
                        idName.val(name);
                    }

                    if (description !== null) {
                        description = description.replace(/\n/g, "<br />");
                    }

                    description = "<p>" + description + "<br /></p>";

                    var editor = $("#id_introeditoreditable", parent.document);

                    if (editor !== null) {
                        if (description !== null && description !== "") {
                            editor.html(description);
                        } else {
                            editor.html("");
                        }
                    }

                    editor = $("#id_introeditor", parent.document);

                    if (editor !== null) {
                        if (description !== null && description !== "") {
                            editor.html(description);
                        } else {
                            editor.html("");
                        }
                    }

                    var partnerid = $("#partner_id", parent.document).val();

                    var source = serverHost + "/p/" + partnerid + "/sp/" + partnerid + "00/thumbnail/entry_id/" + id;
                    source = source + "/width/150/height/100/type/3";

                    var idMediaThumbnail = $("#media_thumbnail", parent.document);
                    if (idMediaThumbnail !== null) {
                        idMediaThumbnail.prop("src", source);
                        idMediaThumbnail.prop("alt", name);
                        idMediaThumbnail.prop("title", name);
                    }

                    var idMediaProperties = $("#id_media_properties", parent.document);
                    if (idMediaProperties !== null) {
                        idMediaProperties.css({visibility: "visible"});
                    }

                    var submitMedia = $("#submit_media", parent.document);
                    if (submitMedia !== null) {
                        submitMedia.prop("disabled", false);
                    }
                }
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
                    window.alert("Wrong metadata.");
                    return false;
                }
                if (checkFileSize() === false) {
                    window.alert("Wrong file size.");
                    return false;
                }

                $("#entry_submit").prop("disabled", true);
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
                serviceURL = serviceURL + "uploadToken:fileName=" + encodeURI(videoFilename);
                serviceURL = serviceURL + "&uploadToken:fileSize=" + videoBlob.size;
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
                    }, 50);

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
                fd.append("entry:mediaType", MEDIA_TYPE.VIDEO);
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
                    }, 50);

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

                $("#upload_info").html("");
                $("#upload_info").append("Uploading a recorded video ...");
                $("#upload_info").append("<p>Progress: <span id=\"pvalue\" style=\"color:#00b200\">0.00</span> %</p>");

                // Creates form data.
                fd.append("action", "upload");
                fd.append("ks", ks);
                fd.append("uploadTokenId", uploadTokenId);
                fd.append("fileData", videoBlob, encodeURI(videoFilename), videoBlob.size);
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
                                var newValue = parseInt(e.loaded / e.total * 100);
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
                .done(function(xmlData, textStatus, xhr) {
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
                        window.console.log("Ffile chunk have been transmitted.");
                    }
                    $("#upload_info").append("Attach uploaded file ...<br>");
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

                    // Prints success message.
                    printSuccessMessage(entryId, entryName, entryTags, entryDescription, entryCreatorId);
                    // Update module properties.
                    setModuleProperties(serverHost, entryId, entryName, entryDescription);
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
                    window.console.log("Cannot delete the uploadToken ! (Cannot connect to kaltura server.)");
                    if (xmlData !== null) {
                        window.console.dir(xmlData);
                    }
                });
            }

            // This function execute when window is chagned.
            $(window).on("change", function() {
                checkForm();
            });

            // This function execute when window is loaded.
            $(window).on("load", function() {
                $("#name").val("");
                $("#tags").val("");
                $("#description").val("");
            });

            removeVideo();

            // This function execute when window is uloaded.
            $(window).on("unload", function() {
                if (blobUrl !== null) {
                    if (window.URL && window.URL.revokeObjectURL) {
                        window.URL.revokeObjectURL(blobUrl);
                    } else {
                        window.webkitURL.revokeObjectURL(blobUrl);
                    }
                    videoBlob = null;
                    blobUrl = null;
                }

                if (localStream !== null) {
                    if (localStream.getTracks) {
                        var tracks = localStream.getTracks();
                        for (var i = tracks.length - 1; i >= 0; --i) {
                            tracks[i].stop();
                        }
                    } else {
                        localStream.stop();
                    }
                    if (document.getElementById("webcam").srcObject) {
                        document.getElementById("webcam").srcObject = null;
                    }
                }

                sessionEnd();
            });

            // This function execute when window is resized.
            $(window).resize(centeringModalSyncer("#uploader_content"));

            $("#uploader_cancel").on("click", function() {
                fadeOutRecorderWindow();
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
        }
    };
});
