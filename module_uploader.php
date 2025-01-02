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
 * Simple media uploader script for resource and activity module.
 *
 * @package   local_yumymedia
 * @copyright (C) 2016-2025 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

defined('MOODLE_INTERNAL') || die();

header('Access-Control-Allow-Origin: *');

global $USER, $COURSE;

$PAGE->set_context(context_system::instance());
$header = format_string($SITE->shortname). ": " . get_string('uploader_hdr', 'local_yumymedia');

$PAGE->set_pagetype('module_uploader');
$PAGE->set_url('/local/yumymedia/module_uploader.php');
$PAGE->set_course($COURSE);
$PAGE->set_pagelayout('embedded');
$PAGE->set_title($header);
$PAGE->set_heading($header);
$PAGE->add_body_class('mymedia-index');
$PAGE->requires->css('/local/yumymedia/css/yumymedia.css');
$PAGE->requires->css('/local/yumymedia/css/module_uploader.css');
$PAGE->requires->js_call_amd('local_yumymedia/moduleuploader', 'init', null);

require_login();

echo $OUTPUT->header();

$context = context_user::instance($USER->id);

require_capability('local/yumymedia:view', $context, $USER);

$renderer = $PAGE->get_renderer('local_yumymedia');

echo $renderer->create_uploader_markup('file', 'module');

echo $OUTPUT->footer();
