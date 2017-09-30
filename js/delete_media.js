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
 * YU Kaltura "My Media" script for delete media.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University (info-cc@ml.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/*global $:false unsed:false undef:false jQuery:true */
/* global $ */

/**
 * Entry unload callback.
 */
window.unload = function() {
    sessionEnd();
};

/**
 * This function close session between client and kaltura server.
 * @access public
 * @param none.
 * @return nothing.
 */
function sessionEnd()
{
    var server_host = $("#kaltura_host").val();
    var serviceURL = server_host + "/api_v3/service/session/action/end";

    // Transmits data.
    $.ajax ({
        type: "GET",
        url: serviceURL,
        cache: false
    })
    .done(function(xmlData) {
        // When format of response is not XML.
        if (xmlData === null) {
            // Do nothing.
        }
        else {
            // Do nothing.
        }
    })
    .fail(function(xmlData) {
        // Do nothing.
    });
}
