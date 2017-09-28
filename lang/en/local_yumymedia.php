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
 * String script for "My Media".
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'My Media';

// Capability strings.
$string['yumymedia:view'] = 'View My Media page';
$string['yumymedia:search'] = 'Search for uploaded media';
$string['yumymedia:editmetadata'] = 'Edit media metadata';
$string['yumymedia:upload'] = 'Upload a media';
$string['yumymedia:delete'] = 'Delete uploaded media';
$string['yumymedia:download'] = 'Download uploaded media';
$string['yumymedia:clip'] = 'Create a clip of a media';

// Navigation block.
$string['nav_mymedia'] = 'My Media';
$string['nav_upload'] = 'Upload';

// Heading.
$string['heading_mymedia'] = 'My Media';

// Video actions.
$string['preview_link'] = 'Preview';
$string['share_link'] = 'Share';
$string['edit_link'] = 'Edit';
$string['clip_link'] = 'Clip';
$string['delete_link'] = 'Delete';
$string['download_link'] = 'Download';
$string['access_link'] = 'Access';

// Video details panel.
$string['details'] = 'Video Details';

// Video details tabs.
$string['tab_preview'] = 'Preview';
$string['tab_metadata'] = 'Edit';
$string['tab_share'] = 'Share';
$string['tab_embed'] = 'Embed';
$string['metadata_media_name'] = 'Name: ';
$string['metadata_media_tags'] = 'Tags: ';
$string['metadata_media_desc'] = 'Description: ';
$string['metadata_media_created'] = 'Created: ';
$string['media_converting'] = 'The media is still converting.  Please try again soon.';
$string['loading'] = 'Loading... please wait';
$string['scr_loading'] = 'Loading...';
$string['save'] = 'Save & exit';
$string['missing_required'] = 'Please enter a name for the media';
$string['error_saving'] = 'There was an error saving the settings.<br>Please contact your system administrator.';
$string['error_not_owner'] = 'You must be the owner of the media.<br>If you are please contact your system administrator.';
$string['success_saving_hdr'] = 'Saved';
$string['success_saving'] = 'Successfully saved media settings';
$string['failure_saved_hdr'] = 'Settings not saved';
$string['check_all'] = 'Check all';
$string['site_share'] = 'Share with site';
$string['media_error'] = 'There was an error processing this media.<br>Please try another media.';
$string['media_bad'] = 'Please do not use this media';
$string['media_retrival_error'] = 'Error retrieving the media.<br>Please try again.';
$string['converting'] = 'Media converting';
$string['internal'] = 'Internal';
$string['continue'] = 'Continue';

// Deleting a media.
$string['delete_media_title'] = 'Delete Media';
$string['delete_media_hdr'] = 'You are about to delete a media';
$string['delete_media_confirm'] = 'Are you sure that you want to delete this media?<br>Once this action has been performed it cannot be undone.';
$string['delete_media_complete'] = 'Media has been deleted.';
$string['delete_media_failed'] = 'Failed to delete media';
$string['delete_media_failed_not_owner'] = 'You cannot delete a media you do not own.<br>If you own this media, please contact the site administrator.';
$string['delete_media_not_exist'] = 'This media no longer exists.';

// Video Upload.
$string['session_failed'] = 'Unable to start new kaltura session for media uploading.<br>Please contact your site administrator.';
$string['upload'] = 'Upload media or record from webcam';
$string['simple_upload'] = 'Upload your media';
$string['upload_success_hdr'] = 'Upload Success';
$string['upload_success'] = 'Media uploaded successfully';

// Search.
$string['search'] = 'Search';
$string['search_clear'] = 'Clear';
$string['search_text_tooltip'] = 'Enter media name or tags';

// Trouble.
$string['problem_viewing'] = 'There is a problem displaying the page.  Please try again or contact your site administrator';
$string['no_medias'] = 'No media found';
$string['permission_disable'] = 'You don\'t have permission to use kaltura media.';

// Sorting.
$string['sortby'] = 'Sort by';
$string['mostrecent'] = 'Most recent';
$string['oldest'] = 'Oldest';
$string['medianameasc'] = 'Media name (ascending)';
$string['medianamedesc'] = 'Media name (descending)';

// Delete media.
$string['media_used'] = 'This media is used in the following courses.<br>So that, you cannot delete this media.';

// Access Control.
$string['access_media_title'] = 'Link and Access Control';
$string['default_access_control_failed'] = 'Default access control not found.<br>';
$string['default_access_control'] = 'Default';
$string['internal_access_control'] = 'Internal only';
$string['access_control'] = 'Access control';
$string['heading_summary'] = 'Summary';
$string['heading_link_type'] = 'Link Type';
$string['label_embed_code'] = 'Embed Code';
$string['label_page_url'] = 'Page URL';
$string['heading_access_control'] = 'Access Control';
$string['access_media_failed_not_owner'] = 'You cannot access a media you do not own.<br>If you own this media, please contact the site administrator.';
$string['access_media_not_exist'] = 'This media no longer exists.';
