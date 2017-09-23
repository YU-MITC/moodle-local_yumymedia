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
 * Refactored code from the YU Kaltura local plug-in directory. This script
 * has less code and performs an additional check for the media's custom
 * metadata fields.
 *
 * @package    local
 * @subpackage yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

function local_source_url($connection, $entryid) {

    require_login();
    global $USER;

    $url = '';

    $assetarray = $connection->flavorAsset->getByEntryId($entryid);

    foreach ($assetarray as $flavor) {
        if ($flavor->isOriginal == true and $flavor->status == KalturaFlavorAssetStatus::READY) {
            $url = $connection->flavorAsset->getUrl($flavor->id);
        }
    }

    return $url;
}
