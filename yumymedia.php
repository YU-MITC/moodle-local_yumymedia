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
 * YU Kaltura My Media Gallery main page
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');
require_once('lib.php');

defined('MOODLE_INTERNAL') || die;

header('Access-Control-Allow-Origin: *');

global $SESSION, $USER, $COURSE, $SITE;

$page = optional_param('page', 0, PARAM_INT);
$sort = optional_param('sort', 'recent', PARAM_TEXT);
$simplesearch = '';
$medias = 0;

$mymedia = get_string('heading_mymedia', 'local_yumymedia');
$PAGE->set_context(context_system::instance());
$header  = format_string($SITE->shortname).": $mymedia";

$PAGE->set_url('/local/yumymedia/yumymedia.php');
$PAGE->set_course($SITE);

require_login();

$PAGE->set_pagetype('mymedia-index');
$PAGE->set_pagelayout('standard');
$PAGE->set_title($header);
$PAGE->set_heading($header);
$PAGE->add_body_class('mymedia-index');

$PAGE->requires->css('/local/yumymedia/css/yumymedia.css');

// Connect to Kaltura.
$kaltura = new yukaltura_connection();
$connection = $kaltura->get_connection(true, KALTURA_SESSION_LENGTH);

if (!$connection) {
    $url = new moodle_url('/admin/settings.php', array('section' => 'local_yukaltura'));
    print_error('conn_failed', 'local_yukaltura', $url);
}

$partnerid = local_yukaltura_get_partner_id();

// Include javascript for screen recording widget.
$uiconfid  = local_yukaltura_get_player_uiconf('yumymedia_screen_recorder');
$host = local_yukaltura_get_host();
$url = new moodle_url("{$host}/p/{$partnerid}/sp/{$partnerid}/ksr/uiconfId/{$uiconfid}");
$PAGE->requires->js($url, true);

$courseid = $COURSE->id;

if (local_yukaltura_has_mobile_flavor_enabled() && local_yukaltura_get_enable_html5()) {
    $uiconfid = local_yukaltura_get_player_uiconf('player_resource');
    $url = new moodle_url(local_yukaltura_html5_javascript_url($uiconfid));
    $PAGE->requires->js($url, true);
    $url = new moodle_url('/local/yukaltura/js/frameapi.js');
    $PAGE->requires->js($url, true);
}

echo $OUTPUT->header();

if ($data = data_submitted() and confirm_sesskey()) {
    // Make sure the user has the capability to search, and if the required parameter is set.

    if (has_capability('local/yumymedia:search', $PAGE->context, $USER) && isset($data->simple_search_name)) {

        $data->simple_search_name = clean_param($data->simple_search_name, PARAM_NOTAGS);

        if (isset($data->simple_search_btn_name)) {
            $SESSION->mymedia = $data->simple_search_name;
        } else if (isset($data->clear_simple_search_btn_name)) {
            $SESSION->mymedia = '';
        }
    } else {
        // Clear the session variable in case the user's permissions were revoked during a search.
        $SESSION->mymedia = '';
    }
}

$context = context_user::instance($USER->id);

require_capability('local/yumymedia:view', $context, $USER);

$renderer = $PAGE->get_renderer('local_yumymedia');

if (local_yukaltura_get_mymedia_permission()) {
    try {
        if (!$connection) {
            throw new Exception("Unable to connect");
        }

        $perpage = get_config(KALTURA_PLUGIN_NAME, 'mymedia_items_per_page');

        if (empty($perpage)) {
            $perpage = MYMEDIA_ITEMS_PER_PAGE;
        }

        $SESSION->mymediasort = $sort;

        $medias = null;

        $accesscontrol = local_yukaltura_get_internal_access_control($connection);

        try {
            // Check if the sesison data is set.
            if (isset($SESSION->mymedia) && !empty($SESSION->mymedia)) {
                $medias = local_yukaltura_search_mymedia_medias($connection, $SESSION->mymedia, $page + 1, $perpage, $sort);
            } else {
                $medias = local_yukaltura_search_mymedia_medias($connection, '', $page + 1, $perpage, $sort);
            }

            $total = $medias->totalCount;
        } catch (Exception $ex) {
            $medias = null;
        }

        if ($medias instanceof KalturaMediaListResponse &&  0 < $medias->totalCount ) {
            $medias = $medias->objects;

            $pagenum = $page;

            // Set totalcount, current page number, number of items per page.
            // Remember to check the session if a search has been performed.
            $page = $OUTPUT->paging_bar($total,
                                        $page,
                                        $perpage,
                                        new moodle_url('/local/yumymedia/yumymedia.php', array('sort' => $sort)));


            echo $renderer->create_options_table_upper($page);

            echo $renderer->create_medias_table($medias, $pagenum, $sort, $accesscontrol);

            echo $renderer->create_options_table_lower($page);

        } else {
            echo $renderer->create_options_table_upper($page);

            echo '<center>'. get_string('no_medias', 'local_yumymedia') . '</center>';

            echo $renderer->create_medias_table(array(), 0, 'recent', $connection);
        }

        // Get Media detail panel markup.
        $mediadetails = $renderer->media_details_markup();
        $dialog = $renderer->create_simple_dialog_markup();

        // Load YUI modules.
        $jsmodule = array(
            'name'     => 'local_yumymedia',
            'fullpath' => '/local/yumymedia/js/yumymedia.js',
            'requires' => array('base', 'dom', 'node',
                                'event-delegate', 'yui2-container', 'yui2-animation',
                                'yui2-dragdrop', 'tabview',
                                'collection', 'io-base', 'json-parse',

                                ),
            'strings' => array(array('media_converting',   'local_yumymedia'),
                               array('loading',            'local_yumymedia'),
                               array('error_saving',       'local_yumymedia'),
                               array('missing_required',   'local_yumymedia'),
                               array('error_not_owner',    'local_yumymedia'),
                               array('failure_saved_hdr',  'local_yumymedia'),
                               array('success_saving',     'local_yumymedia'),
                               array('success_saving_hdr', 'local_yumymedia'),
                               array('upload_success_hdr', 'local_yumymedia'),
                               array('upload_success',     'local_yumymedia'),
                               array('continue',           'local_yumymedia')
                               )

            );

        $editmeta = has_capability('local/yumymedia:editmetadata', $context, $USER) ? 1 : 0;

        $savemediascript = "../../local/yumymedia/save_media_details.php?entryid=";
        $conversionscript = "../../local/yumymedia/check_conversion.php?courseid={$courseid}&entryid=";
        $loadingmarkup = $renderer->create_loading_screen_markup();
        $uiconfid = local_yukaltura_get_player_uiconf('player_filter');

        $PAGE->requires->js_init_call('M.local_yumymedia.init',
                                      array($mediadetails,
                                            $dialog,
                                            $conversionscript,
                                            $savemediascript,
                                            $uiconfid,
                                            $loadingmarkup,
                                            $editmeta),
                                      true,
                                      $jsmodule);

        $connection->session->end();
    } catch (Exception $ex) {
        $errormessage = 'View - error main page(' .  $ex->getMessage() . ')';
        print_error($errormessage, 'local_yumymedia');

        echo get_string('problem_viewing', 'local_yumymedia') . '<br>';
        echo $ex->getMessage();
    }

} else {
    echo get_string('permission_disable', 'local_yumymedia');
}

echo $OUTPUT->footer();
