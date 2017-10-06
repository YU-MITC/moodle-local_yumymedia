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

if (!defined('MOODLE_INTERNAL')) {
    // It must be included from a Moodle page.
    die('Direct access to this script is forbidden.');
}

header('Access-Control-Allow-Origin:	*');

global $USER, $SESSION;

$mymedia = get_string('heading_mymedia', 'local_yumymedia');
$PAGE->set_context(context_system::instance());
$header  = format_string($SITE->shortname).": Media Uploader";

$PAGE->set_url('/local/yumymedia/simple_uploader.php');
$PAGE->set_course($SITE);

require_login();

$PAGE->set_pagetype('mymedia-index');
$PAGE->set_pagelayout('standard');
$PAGE->set_title($header);
$PAGE->set_heading($header);
$PAGE->add_body_class('mymedia-index');
$PAGE->requires->css('/local/yumymedia/css/yumymedia.css');
$PAGE->requires->js_call_amd('local_yumymedia/simpleuploader', 'init', array());

$context = context_user::instance($USER->id);

echo $OUTPUT->header();

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
        $output .= get_string('session_failed', 'local_yumymedia');
        $output .= html_writer::empty_tag('br');

        if (empty($rootpath)) {
            $output .= '(Cannot set root category of content.)';
            $output .= html_writer::empty_tag('br');
        }

        if ($ks == null) {
            $output .= '(Cannot set kaltura session.)';
            $output .= html_writer::empty_tag('br');
        }

        $attr = array('type' => 'button', 'name' => 'uploader_cancel', 'id' => 'uploader_cancel',
                      'value' => 'Back');
        $output .= html_writer::empty_tag('input', $attr);
    } else if ($control == null) {
        $output .= get_string('default_access_control_failed', 'local_yumymedia');
        $output .= html_writer::empty_tag('br');
        $attr = array('type' => 'button', 'name' => 'uploader_cancel', 'id' => 'uploader_cancel',
                      'value' => 'Back');
        $output .= html_writer::empty_tag('input', $attr);
    } else { // Session started.

        // Set category of media.
        $categorypath = $rootpath . '>' . $USER->username;

        $attr = array('id' => 'upload_info', 'name' => 'upload_info');
        $output .= html_writer::start_tag('div', $attr);

        $output .= html_writer::start_tag('h2'. null);
        $output .= 'File Upload Form';
        $output .= html_writer::end_tag('h2');

        $attr = array('method' => 'post', 'name' => 'entry_form', 'enctype' => 'multipart/form-data',
                      'action' => $uploadurl . '" autocomplete="off"');
        $output .= html_writer::start_tag('form', $attr);

        $attr = array('id' => 'entry_steps');
        $output .= html_writer::start_tag('div', $attr);
        $output .= '1. Please slect a file.';
        $output .= html_writer::end_tag('div');
        $output .= html_writer::empty_tag('br', null);

        $attr = array('type' => 'file', 'size' => '40', 'id' => 'fileData', 'name' => 'fileData',
                      'required' => 'true');
        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::empty_tag('br', null);

        $attr = array('id' => 'file_info', 'name' => 'file_info');
        $output .= html_writer::start_tag('div', $attr);
        $output .= html_writer::end_tag('div');
        $output .= html_writer::empty_tag('br', null);

        $attr = array('id' => 'entry_steps');

        $output .= html_writer::start_tag('div', $attr);
        $output .= '2. Please input metadata (atrribute information), and submit the file.';
        $output .= html_writer::empty_tag('br', null);
        $output .= '(';
        $attr = array('id' => 'entry_warning');
        $output .= html_writer::start_tag('span', $attr);
        $output .= '* : Required field';
        $output .= html_writer::end_tag('span');
        $output .= ')';
        $output .= html_writer::end_tag('div');
        $output .= html_writer::empty_tag('br', null);

        $output .= html_writer::start_tag('fieldset', null);

        $attr = array('border' => '0');
        $output .= html_writer::start_tag('table', $attr);

        $output .= html_writer::start_tag('tr');
        $attr = array('id' => 'metadata_fields', 'valign' => 'top');
        $output .= html_writer::start_tag('td');
        $output .= 'Name&nbsp;';
        $attr = array('id' => 'entry_warning');
        $output .= html_writer::start_tag('span', $attr);
        $output .= '*';
        $output .= html_writer::end_tag('span');
        $output .= '&nbsp;:';
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $attr = array('type' => 'text', 'name' => 'name', 'id' => 'name', 'size' => '30',
                      'required' => 'true');
        $output .= html_writer::empty_tag('input', $attr);
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr', null);
        $attr = array('id' => 'metadata_fields', 'valign' => 'top');
        $output .= html_writer::start_tag('td', $attr);
        $output .= 'Tags&nbsp;';
        $attr = array('id' => 'entry_warning');
        $output .= html_writer::start_tag('span', $attr);
        $output .= '*';
        $output .= html_writer::end_tag('span');
        $output .= '&nbsp;:';
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $attr = array('type' => 'text', 'name' => 'tags', 'id' => 'tags', 'size' => '30',
                      'required' => 'true');
        $output .= html_writer::empty_tag('input', $attr);
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr', null);
        $attr = array('id' => 'metadata_fields');
        $output .= html_writer::start_tag('td', $attr);
        $output .= 'Description:';
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td', null);
        $attr = array('name' => 'description', 'id' => 'description',
                      'cols' => '30', 'rows' => '5', 'maxlength' => '150');
        $output .= html_writer::start_tag('textarea', $attr);
        $output .= html_writer::end_tag('textarea');
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        $output .= html_writer::empty_tag('br', null);

        $attr = array('type' => 'hidden', 'id' => 'kalturahost',
                      'name' => 'kalturahost', 'value' => "$kalturahost");
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'ks', 'name' => 'ks', 'value' => "$ks");
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'type', 'name' => 'type', 'value' => '');
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'categories', 'name' => 'categories', 'value' => "$categorypath");
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'creatorId', 'name' => 'creatorId', 'value' => "$USER->username");
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'controlId', 'name' => 'controlId', 'value' => "$control->id");
        $output .= html_writer::empty_tag('input', $attr);
        $attr = array('type' => 'hidden', 'id' => 'entry', 'name' => 'entry', 'value' => '');
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'button', 'name' => 'entry_submit', 'id' => 'entry_submit',
                      'value' => 'Upload');
        $output .= html_writer::start_tag('input', $attr);

        $output .= '&nbsp;&nbsp;';

        $attr = array('type' => 'reset', 'name' => 'reset', 'id' => 'entry_reset',
                      'value' => 'Reset');
        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('fieldset');

        $output .= html_writer::end_tag('form');

        $output .= html_writer::empty_tag('hr', null);
        $output .= html_writer::empty_tag('br', null);

        $attr = array('type' => 'button', 'name' => 'uploader_cancel', 'id' => 'uploader_cancel',
                      'value' => 'Cancel');
        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('div');
        $attr = array('id' => 'modal_content');
        $output .= html_writer::start_tag('div', $attr);
        $attr = array('align' => 'center');
        $output .= html_writer::start_tag('h3', $attr);
        $output .= 'Uploading';
        $output .= html_writer::end_tag('h3');
        $output .= html_writer::end_tag('div');
    }

    echo $output;
}

echo $OUTPUT->footer();
