<?php
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
 * Conversion check script in "My Media".
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

defined('MOODLE_INTERNAL') || die();

$PAGE->set_url('/local/yumymedia/check_conversion.php');
$PAGE->set_course($SITE);

require_login();

$entryid = required_param('entryid', PARAM_TEXT);
$height = optional_param('height', 0, PARAM_INT);
$width = optional_param('width', 0, PARAM_INT);
$uiconfid = optional_param('uiconf_id', 0, PARAM_INT);
$title = optional_param('media_title', '', PARAM_TEXT);
$widget = optional_param('widget', 'kdp', PARAM_TEXT);
$courseid = required_param('courseid', PARAM_INT);

$thumbnail = '';
$data = '';
$entryobj = null;

// When request is for a kaltura dynamic player get the entry object disregarding the entry object status.
if (0 == strcmp($widget, 'kdp')) {

    $entryobj = local_yukaltura_get_ready_entry_object($entryid, false);

    if (empty($entryobj)) { // Sometimes the connection to Kaltura times out.
        $data->markup = get_string('media_retrival_error', 'local_yumymedia');
        die;
    }

    // Determine the type of media (See KALDEV-28).
    if (!local_yukaltura_media_type_valid($entryobj)) {
        $entryobj = local_yukaltura_get_ready_entry_object($entryobj->id, false);
    }

    $entryobj->height = !empty($height) ? $height : $entryobj->height;
    $entryobj->width = !empty($width) ? $width : $entryobj->width;

    $data = $entryobj;
    $data->course_share = '';
    $data->site_share   = '';

    // Retrieve the media's custom metadata TODO: Eventually use the connection object everywhere.
    $kaltura = new yukaltura_connection();
    $connection = $kaltura->get_connection(true, KALTURA_SESSION_LENGTH);

    if (KalturaEntryStatus::READY == (string) $entryobj->status) {

        // Create the user Kaltura session.
        $session  = local_yukaltura_generate_kaltura_session(array($entryobj->id));

        $data->markup = local_yukaltura_get_iframeembed_code($entryobj, $uiconfid, $session);

        if (local_yukaltura_has_mobile_flavor_enabled() && local_yukaltura_get_enable_html5()) {
            $data->script = 'kAddedScript = false; kCheckAddScript();';
        }

    } else {

        // Clear the cache.
        KalturaStaticEntries::remove_entry($data->id);

        switch ((string) $entryobj->status) {
            case KalturaEntryStatus::ERROR_IMPORTING:
                $data->markup = get_string('media_error', 'local_yumymedia');
                break;
            case KalturaEntryStatus::ERROR_CONVERTING:
                $data->markup = get_string('media_error', 'local_yumymedia');
                break;
            case KalturaEntryStatus::INFECTED:
                $data->markup = get_string('media_bad', 'local_yumymedia');
                break;
            case KalturaEntryStatus::PRECONVERT:
            case KalturaEntryStatus::IMPORT:
                $data->markup = get_string('converting', 'local_yumymedia');
        }

    }

}

$data = json_encode($data);

echo $data;

die();
