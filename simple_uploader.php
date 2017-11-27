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
 * Simple media uploader script in YU Kaltura My Media Gallery.
 *
 * @package    local_yumymedia
 * @copyright  2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

defined('MOODLE_INTERNAL') || die();

header('Access-Control-Allow-Origin: *');

global $USER, $SESSION;

$mymedia = get_string('heading_mymedia', 'local_yumymedia');
$PAGE->set_context(context_system::instance());
$header  = format_string($SITE->shortname). ": " . get_string('uploader_hdr', 'local_yumymedia');

$PAGE->set_url('/local/yumymedia/simple_uploader.php');
$PAGE->set_course($SITE);

require_login();

$PAGE->set_pagetype('simple-uploader');
$PAGE->set_pagelayout('standard');
$PAGE->set_title($header);
$PAGE->set_heading($header);
$PAGE->add_body_class('mymedia-index');
$PAGE->requires->css('/local/yumymedia/css/yumymedia.css');
$PAGE->requires->js_call_amd('local_yumymedia/simpleuploader', 'init', array());

echo $OUTPUT->header();

$context = context_user::instance($USER->id);

require_capability('local/yumymedia:view', $context, $USER);

$renderer = $PAGE->get_renderer('local_yumymedia');

// Star connection to kaltura.
$kaltura = new yukaltura_connection();
$connection = $kaltura->get_connection(true, KALTURA_SESSION_LENGTH);

if (!$connection) {  // When connection failed.
    $url = new moodle_url('/admin/settings.php', array('section' => 'local_yukaltura'));
    print_error('conn_failed', 'local_yukaltura', $url);
} else {  // When connection succeed.
    // Get publisher name and secret.
    $publishername = local_yukaltura_get_publisher_name();
    $secret = local_yukaltura_get_admin_secret();
    $kalturahost = local_yukaltura_get_host();
    $partnerid = local_yukaltura_get_partner_id();
    $control = local_yukaltura_get_default_access_control($connection);
    $expiry = 21600;

    $uploadurl = local_yukaltura_get_host() . '/api_v3/service/uploadToken/action/upload';

    // Start kaltura session.
    $ks = $connection->session->start($secret, $publishername, KalturaSessionType::ADMIN, $partnerid, $expiry);

    // Get the root category path.
    $result = local_yukaltura_get_root_category();
    $rootid = $result['id'];
    $rootpath = $result['name'];

    $output = '';

    if ($ks == null || empty($rootpath)) { // Session failed.
        $output .= $renderer->create_session_failed_markup($ks, $rootpath);
    } else if ($control == null) {
        $output .= $renderer->create_access_control_failed_markup();
    } else { // Session started.
        $attr = array('id' => 'upload_info', 'name' => 'upload_info');
        $output .= html_writer::start_tag('div', $attr);

        $output .= html_writer::start_tag('h2'. null);
        $output .= get_string('upload_form_hdr', 'local_yumymedia');
        $output .= html_writer::end_tag('h2');

        $attr = array('method' => 'post', 'name' => 'entry_form', 'enctype' => 'multipart/form-data',
                      'action' => $uploadurl . '" autocomplete="off"');
        $output .= html_writer::start_tag('form', $attr);

        $output .= $renderer->create_file_selection_markup();

        $output .= $renderer->create_entry_metadata_markup($ks, $kalturahost, $rootpath, $control);

        $output .= html_writer::end_tag('form');

        $output .= html_writer::empty_tag('hr', null);
        $output .= html_writer::empty_tag('br', null);

        $output .= $renderer->create_upload_cancel_markup();

        $output .= html_writer::end_tag('div');

        $output .= $renderer->create_modal_content_markup();
    }

    echo $output;
}

echo $OUTPUT->footer();
