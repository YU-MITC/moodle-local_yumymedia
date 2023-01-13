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
 * Install script for local_yumymedia.
 *
 * @package   local_yumymedia
 * @copyright (C) 2016-2023 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Perform the post-install procedures.
 */
function xmldb_local_yumymedia_install() {
    global $DB;
    $values = $DB->get_field('config', 'value', ['name' => 'customusermenuitems']);
    $items = explode("\n", $values);
    $addflag = true;
    foreach ($items as $item) {
        if (preg_match('/\/local\/yumymedia\/yumymedia\.php/', $item)) {
            $addflag  = false;
        }
    }
    if ($addflag && !empty($items)) {
        array_push($items, "nav_mymedia,local_yumymedia|/local/yumymedia/yumymedia.php");
        $values = implode("\n", $items);
        $DB->set_field('config', 'value', $values, ['name' => 'customusermenuitems']);
    }

    return true;
}
