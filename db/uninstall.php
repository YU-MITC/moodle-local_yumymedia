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
 * YU My Media plugin uninstall.
 *
 * Sometimes, changes between versions involve alterations to database
 * structures and other major things that may break installations. The upgrade
 * function in this file will attempt to perform all the necessary actions to
 * upgrade your older installation to the current version. If there's something
 * it cannot do itself, it will tell you what you need to do.  The commands in
 * here will all be database-neutral, using the functions defined in DLL libraries.
 *
 * @package   local_yumymedia
 * @copyright (C) 2016-2023 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Execute yumymedia uninstall.
 *
 * @return bool - this function always return true.
 */
function xmldb_local_yumymedia_uninstall() {
    global $DB;
    $values = $DB->get_field('config', 'value', ['name' => 'customusermenuitems']);
    $items = explode("\n", $values);
    $itemarray = array();

    foreach ($items as $item) {
        if (!preg_match('/\/local\/yumymedia\/yumymedia\.php/', $item)) {
            array_push($itemarray, $item);
        }
    }

    if (empty($itemarray)) {
        $values = '';
    } else {
        $values = implode("\n", $itemarray);
    }

    $DB->set_field('config', 'value', $values, ['name' => 'customusermenuitems']);

    return true;
}
