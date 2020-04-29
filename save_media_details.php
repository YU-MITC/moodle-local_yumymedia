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
 * Saves information about the YU Kaltura media and returns a status.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2020 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

$entryid = required_param('entryid', PARAM_TEXT);
$name = required_param('name', PARAM_TEXT);
$tags = required_param('tags', PARAM_TEXT);
$desc = required_param('desc', PARAM_TEXT);

defined('MOODLE_INTERNAL') || die();

global $USER;

$PAGE->set_url('/local/yumymedia/save_media_details.php');

require_login();

$context = context_user::instance($USER->id);
require_capability('local/yumymedia:view', $context, $USER);

if (empty($entryid)) {
    $errormessage = 'Update media details - media entry id empty, entry id - ' . $entryid;
    print_error($errormessage, 'local_yumymedia');
    echo 'n';
    die();
}

if (empty($name)) {
    $errormessage = 'Name is empty';
    print_error($errormessage, 'local_yumymedia');
    echo 'n';
    die();
}

// Initialize media cache.
$entries = new KalturaStaticEntries();

try {
    // Create a Kaltura connection object.
    $clientobj = local_yukaltura_login(false, true, '');

    if (!$clientobj) {
        $errormessage = 'Connection failed when saving';
        print_error($errormessage, 'local_yumymedia');
    }

    // Start a multi request.
    $clientobj->startMultiRequest();

    // Get the entry object.
    $clientobj->media->get($entryid);

    // Create KalturaMediaEntry object with new properties.
    $mediaentry = new KalturaMediaEntry();

    if (has_capability('local/yumymedia:editmetadata', $context, $USER)) {
        $mediaentry->name        = $name;
        $mediaentry->tags        = $tags;
        $mediaentry->description = $desc;

    } else {
        $mediaentry->name        = '{1:result:name}';
        $mediaentry->tags        = '{1:result:tags}';
        $mediaentry->description = '{1:result:description}';
    }

    $clientobj->media->update('{1:result:id}', $mediaentry);

    $result = $clientobj->doMultiRequest();

    // Clear the cache.
    KalturaStaticEntries::remove_entry($entryid);

    // Verify returned data.
    if (!is_array($result)) {
        $errormessage = 'Connection failed when saving';
        print_error($errormessage, 'local_yumymedia');
        echo 'n';
        die();
    }

    // Verify the first API call.
    if (!array_key_exists(0, $result) || !$result[0] instanceof KalturaMediaEntry) {
        $errormessage = 'view - media->get,' . $result[0]['mesasge'];
        print_error($errormessage, 'local_yumymedia');
        echo 'n';
        die();
    }

    // Verify that the user is the owner of the requested media.
    if (0 != strcmp($result[0]->userId, $USER->username)) {
        $errormessage = 'update - media details, User is not the owner of media';
        print_error($errormessage, 'local_yumymedia');
        echo 'n';
        die();
    }

    if (!array_key_exists(1, $result) || !$result[1] instanceof KalturaMediaEntry) {
        $errormessage = 'update - media->update,' . $result[1]['message'];
        prnt_error($errormessage, 'local_yumymedia');
        echo 'n';
        die();
    }

    // Only cache the entry if the status is equal to ready.
    if (KalturaEntryStatus::READY == $result[1]->status) {
        KalturaStaticEntries::add_entry_object($result[1]);
    }

    echo 'y';

} catch (Exception $ex) {
    $errormessage = 'Error - exception caught(' . $ex->getMessage() . ')';
    print_error($errormessage, 'local_yumymedia');
    echo 'n' . $ex->getMessage();
}

die();
