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
 * YU Kaltura My Media renderer class.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/lib/tablelib.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yumymedia/download_media.php');
require_once(dirname(dirname(dirname(__FILE__))) . '/local/yukaltura/locallib.php');

if (!defined('MOODLE_INTERNAL')) {
    // It must be included from a Moodle page.
    die('Direct access to this script is forbidden.');
}

/**
 * Renderer class of local_yumymedia
 * @package local_yumymedia
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class local_yumymedia_renderer extends plugin_renderer_base {

    public function all_flavors_ready($connection, $entryid) {
        $flag = true;

        $flavorassetarray = $connection->flavorAsset->getByEntryId($entryid);

        foreach ($flavorassetarray as $flavor) {
            if ($flavor->status != KalturaFlavorAssetStatus::READY and
                $flavor->status != KalturaFlavorAssetStatus::NOT_APPLICABLE and
                $flavor->status != KalturaFlavorAssetStatus::DELETED) {
                $flag = false;
            }
        }

        return $flag;
    }

    /**
     * This function outputs a table layout for display medias
     *
     * @param array $medialist - array of Kaltura media entry objects.
     * @param string $page - HTML markup of paging bar.
     * @param string $sort - sotring option.
     * @param object $accesscontrol - Access control objectt of Internal access restriction.
     *
     * @return HTML markup
     */
    public function create_medias_table($medialist = array(), $page, $sort, $accesscontrol) {
        global $OUTPUT;

        $output = '';
        $maxcolumns = 3;

        $table = new html_table();

        $table->id = 'mymedia_medias';
        $table->size = array('25%', '25%', '25%');
        $table->colclasses = array('mymedia column 1', 'mymedia column 2', 'mymedia column 3');

        $table->align = array('center', 'center', 'center');
        $table->data = array();

        $i = 0;
        $x = 0;
        $data = array();

        foreach ($medialist as $key => $media) {
            if (KalturaEntryStatus::READY == $media->status) {
                $data[] = $this->create_media_entry_markup($media, true, $page, $sort, $accesscontrol);
            } else {
                $data[] = $this->create_media_entry_markup($media, false, $page, $sort, $accesscontrol);
            }

            // When the max number of columns is reached, add the data to the table object.
            if ($maxcolumns == count($data)) {

                $table->data[]       = $data;
                $table->rowclasses[] = 'row_' . $i;
                $data                = array();
                $i++;

            } else if ($x == count($medialist) - 1 ) {

                $leftovercells = $maxcolumns - count($data);

                // Add some extra cells to make the table symetrical.
                if ($leftovercells) {
                    for ($t = 1; $t <= $leftovercells; $t++) {
                        $data[] = '';
                    }
                }
                $table->data[] = $data;
                $table->rowclasses[] = 'row_' . $i;

            }

            $x++;
        }

        $attr   = array('style' => 'overflow:auto;overflow-y:hidden');
        $output .= html_writer::start_tag('center');
        $output .= html_writer::start_tag('div', $attr);
        $output .= html_writer::table($table);
        $output .= html_writer::end_tag('div');
        $output .= html_writer::end_tag('center');

        echo $output;
    }

    /**
     * This function creates HTML markup used to sort the media listing.
     *
     * @param none.
     * @return string - HTML markup for sorting pulldown.
     */
    public function create_sort_option() {
        global $CFG, $SESSION;

        $recent = null;
        $old = null;
        $nameasc = null;
        $namedesc = null;
        $sorturl = new moodle_url('/local/yumymedia/yumymedia.php?sort=');

        if (isset($SESSION->mymediasort) && !empty($SESSION->mymediasort)) {
            $sort = $SESSION->mymediasort;
            if ($sort == 'recent') {
                $recent = "selected";
            } else if ($sort == 'old') {
                $old = "selected";
            } else if ($sort == 'name_asc') {
                $nameasc = "selected";
            } else if ($sort == 'name_desc') {
                $namedesc = "selected";
            } else {
                $recent = "selected";
            }
        } else {
            $recent = "selected";
        }

        $sort = '';
        $sort .= get_string('sortby', 'local_yumymedia') . ':' . '&nbsp;';
        $sort .= html_writer::start_tag('select', array('id' => 'mymediasort'));
        $sort .= html_writer::tag('option', get_string('mostrecent', 'local_yumymedia'),
                                  array('value' => $sorturl.'recent', 'selected' => $recent));
        $sort .= html_writer::tag('option', get_string('oldest', 'local_yumymedia'),
                                  array('value' => $sorturl.'old', 'selected' => $old));
        $sort .= html_writer::tag('option', get_string('medianameasc', 'local_yumymedia'),
                                  array('value' => $sorturl.'name_asc', 'selected' => $nameasc));
        $sort .= html_writer::tag('option', get_string('medianamedesc', 'local_yumymedia'),
                                  array('value' => $sorturl.'name_desc', 'selected' => $namedesc));
        $sort .= html_writer::end_tag('select');

        return $sort;
    }

    /**
     * This function create options table printed at upper of media table.
     * @param string $page - HTML markup of paging bar.
     * @param string $partnerid - Partner ID of Kaltura server.
     * @return string - HTML markup of options.
     */
    public function create_options_table_upper($page, $partnerid = '') {
        global $USER;

        $output = '';

        $attr = array('border' => 0, 'width' => '100%',
                        'class' => 'mymedia upper paging upload search');
        $output .= html_writer::start_tag('table', $attr);

        $attr = array('class' => 'mymedia upper row_0 upload search');
        $output .= html_writer::start_tag('tr', $attr);

        $attr = array('colspan' => 3, 'align' => 'right',
                        'class' => 'mymedia upper col_0');
        $output .= html_writer::start_tag('td', $attr);

        $upload = '';
        $simplesearch = '';

        $context = context_user::instance($USER->id);

        if (has_capability('local/yumymedia:upload', $context, $USER)) {
            $upload = $this->create_upload_markup();
        }

        if (has_capability('local/yumymedia:search', $context, $USER)) {
            $simplesearch = $this->create_search_markup();
        }

        $output .= $upload . '&nbsp;&nbsp;' . $simplesearch;

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $attr   = array('class' => 'mymedia upper row_1 paging');
        $output .= html_writer::start_tag('tr', $attr);

        $attr   = array('colspan' => 3, 'align' => 'center',
                        'class' => 'mymedia upper col_0');
        $output .= html_writer::start_tag('td', $attr);

        if (!empty($page)) {
            $output .= $this->create_sort_option();
            $output .= $page;
        }

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        return $output;
    }

    /**
     * This function create options table printed at lower of media table.
     * @param string $page - HTML markup of paging bar.
     * @return string - HTML markup of options.
     */
    public function create_options_table_lower($page) {
        global $USER;

        $output = '';

        $attr = array('border' => 0, 'width' => '100%');
        $output .= html_writer::start_tag('table', $attr);

        $output .= html_writer::start_tag('tr');

        $attr  = array('colspan' => 3, 'align' => 'center');
        $output .= html_writer::start_tag('td', $attr);

        $output .= $page;

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media name
     *
     * @param string $name - name of media.
     * @param object $internal - access control object of internal access only.
     * @return string - HTML markup of media name.
     */
    public function create_media_name_markup($name, $internal) {

        $output = '';
        $attr = array('class' => 'mymedia media name',
                      'title' => $name);

        $output .= html_writer::start_tag('div', $attr);
        if ($internal == true) {
            $name = $name . '(' . get_string('internal', 'local_yumymedia') . ')';
        }
        $output .= html_writer::tag('label', $name);

        $output .= html_writer::end_tag('div');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media thumbnail
     *
     * @param string - thumbnail URL.
     * @param string - alternate text.
     * @return string - HTML markup of thumbnail.
     */
    public function create_media_thumbnail_markup($url, $alt) {

        $output = '';
        $attr = array('class' => 'mymedia media thumbnail');

        $output .= html_writer::start_tag('div', $attr);

        $attr = array('src' => $url . '/width/150/height/100/type/3',
                         'alt' => $alt,
                         'height' => 100,
                         'width'  => 150,
                         'title' => $alt);

        $output .= html_writer::empty_tag('img', $attr);

        $output .= html_writer::end_tag('div');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media created daytime.
     *
     * @param string $date - created date of media.
     * @param string $entryid - id of media entry.
     * @param int $views - counter value media entry is viewed.
     * @param int $plays - counter value media entry is played.
     * @return string - HTML markup of media created.
     */
    public function create_media_created_markup($date, $entryid, $views, $plays) {

        $output = '';
        $attr   = array('class' => 'mymedia media created',
                        'title' => userdate($date));

        $content = userdate($date) . '<br>id : ' . $entryid . '<br>plays: ' . $plays . ' / ' . $views;

        $output .= $content;

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media id.
     *
     * @param string $entryid - id of media entry.
     * @param int $plays - counter value media entry is played.
     * @return string - HTML markup of media id.
     */
    public function create_media_id_markup($entryid, $plays) {
        $output = '';
        $attr = array('class' => 'mymedia media created',
                      'title' => $entryid);
        $output .= html_writer::start_tag('div', $attr);
        $output .= html_writer::tag('label', 'id : ' . $entryid . '&nbsp;' . '(' . $plays . ')');
        $output .= html_writer::end_tag('div');
        return $output;
    }

    /**
     * This function creates HTML markup used to display the media preview.
     *
     * @param none.
     * @return string - HTML markup of media share.
     */
    public function create_media_preview_link_markup() {

        $output = '';

        $attr = array('class' => 'mymedia media preview',
                      'href' => '#',
                      'title' => get_string('preview_link', 'local_yumymedia')
                     );

        $output .= html_writer::start_tag('a', $attr);
        $output .= get_string('preview_link', 'local_yumymedia');
        $output .= html_writer::end_tag('a');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media edit.
     *
     * @param none.
     * @return string - HTML markup of media edit.
     */
    public function create_media_edit_link_markup() {

        $output = '';

        $attr = array('class' => 'mymedia media edit',
                      'href' => '#',
                      'title' => get_string('edit_link', 'local_yumymedia')
                      );

        $output .= html_writer::start_tag('a', $attr);
        $output .= get_string('edit_link', 'local_yumymedia');
        $output .= html_writer::end_tag('a');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media access.
     *
     * @param none.
     * @return string - HTML markup of media access.
     */
    public function create_media_access_link_markup($entry, $page = 0, $sort = 'recent') {
                global $CFG;

        $output = '';

        $attr   = array('class' => 'mymedia media access',
                        'href' => new moodle_url('/local/yumymedia/access_media.php',
                        array('entryid' => $entry->id, 'page' => $page, 'sort' => $sort))
                        );

        $output .= html_writer::start_tag('a', $attr);
        $output .= get_string('access_link', 'local_yumymedia');
        $output .= html_writer::end_tag('a');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media delete.
     *
     * @param object $entry - object of Kaltura media entry.
     * @param int $page - page number which the media is printed.
     * @param string $sort - sorting option.
     * @return string - HTML markup of media delete.
     */
    public function create_media_delete_link_markup($entry, $page = 0, $sort = 'recent') {

        global $CFG;

        $output = '';

        $attr = array('class' => 'mymedia media delete',
                      'href' => new moodle_url('/local/yumymedia/delete_media.php',
                      array('entryid' => $entry->id, 'confirm' => 'yet', 'page' => $page, 'sort' => $sort))
                      );

        $output .= html_writer::start_tag('a', $attr);
        $output .= get_string('delete_link', 'local_yumymedia');
        $output .= html_writer::end_tag('a');

        return $output;
    }

    /**
     * This function creates HTML markup used to display the media download.
     *
     * @param object $entry - object of Kaltura media entry.
     * @return string - HTML markup of media delete.
     */
    public function create_media_download_link_markup($entry) {

        $output = '';

        $originallink = $entry->downloadUrl;

        if ($originallink != '') {
            $httppattern = '/^http:\/\/[A-Za-z0-9\-\.]{1,61}\//';
            $httpspattern = '/^https:\/\/[A-Za-z0-9\-\.]{1,61}\//';

            $replace = local_yukaltura_get_host() . '/';

            $modifiedlink = preg_replace($httpspattern, $replace, $originallink, 1, $count);
            if ($count != 1) {
                $modifiedlink = preg_replace($httppattern, $replace, $originallink, 1, $count);
                if ($count != 1) {
                    $modifiedlink = $originallink;
                }
            }

            $attr = array('class' => 'mymedia media download',
                       'href' => $modifiedlink
                     );
            $output .= html_writer::start_tag('a', $attr);
            $output .= get_string('download_link', 'local_yumymedia');
            $output .= html_writer::end_tag('a');
            return $output;
        }

        return $output;
    }


    /**
     * This function creates HTML markup for a media entry.
     *
     * @param object $entry- Kaltura media object.
     * @param bool $entryready- true if media entry is ready, otherwise false.
     * @param $sort string - sorting option.
     * @param object accesscontrol - object of acecss conrtol (internal only).
     * @return string - HTML markup of media entry.
     */
    public function create_media_entry_markup($entry, $entryready = true, $page, $sort, $accesscontrol) {

        global $USER;

        $output = '';

        $attr = array('class' => 'mymedia media entry',
                      'id' => $entry->id);

        $output .= html_writer::start_tag('div', $attr);

        $originalurl = $entry->thumbnailUrl;

        $httppattern = '/^http:\/\/[A-Za-z0-9\-\.]{1,61}\//';
        $httpspattern = '/^https:\/\/[A-Za-z0-9\-\.]{1,61}\//';

        $replace = local_yukaltura_get_host() . '/';

        $modifiedurl = preg_replace($httpspattern, $replace, $originalurl, 1, $count);
        if ($count != 1) {
            $modifiedurl = preg_replace($httppattern, $replace, $originalurl, 1, $count);
            if ($count != 1) {
                $modifiedurl = $originalurl;
            }
        }

        $internal = false;

        if ($entry != null and $accesscontrol != null and
            $entry->accessControlId == $accesscontrol->id) {
            $internal = true;
        }

        if ($entryready) {

            $output .= $this->create_media_name_markup($entry->name, $internal);

            $output .= $this->create_media_thumbnail_markup($modifiedurl,
                                                            $entry->name);
        } else {

            $output .= $this->create_media_name_markup($entry->name . ' (' .
                                                       get_string('converting', 'local_yumymedia') . ')', $internal);

            $output .= $this->create_media_thumbnail_markup($modifiedurl,
                                                            $entry->name);
        }

        $output .= $this->create_media_created_markup($entry->createdAt, $entry->id, $entry->views, $entry->plays);

        $attr = array('class' => 'mymedia media action bar',
                      'id' => $entry->id . '_action');

        $output .= html_writer::start_tag('div', $attr);

        $context = context_user::instance($USER->id);

        $output .= $this->create_media_preview_link_markup();
        $output .= '&nbsp;&nbsp;';

        if (has_capability('local/yumymedia:editmetadata', $context, $USER)) {
            $output .= $this->create_media_edit_link_markup();
            $output .= '&nbsp;&nbsp;';
        }

        $output .= $this->create_media_access_link_markup($entry, $page, $sort);

        $output .= html_writer::end_tag('div');

        if (true == $entryready) {

            $output .= html_writer::start_tag('div');

            $output .= $this->create_media_delete_link_markup($entry, $page, $sort);
            $output .= '&nbsp;&nbsp;';

            $output .= $this->create_media_download_link_markup($entry);

            $output .= html_writer::end_tag('div');
        }

        $output .= html_writer::end_tag('div');

        // Add entry to cache.
        $entries = new KalturaStaticEntries();
        KalturaStaticEntries::add_entry_object($entry);
        return $output;

    }

    /**
     * Displays the YUI panel markup used to display embedded media markup.
     *
     * @param none.
     * @return string - HTML markup of media details.
     */
    public function media_details_markup() {
        $output = '';

        $attr = array('id' => 'id_media_details',
                      'class' => 'media_details');
        $output .= html_writer::start_tag('div', $attr);

        $attr = array('class' => 'hd');
        $output .= html_writer::tag('div', get_string('details', 'local_yumymedia'), $attr);

        $attr = array('class' => 'bd');
        $output .= html_writer::tag('div', $this->media_details_tabs_markup(), $attr);

        $attr = array('id' => 'id_media_details_save',
                      'type' => 'submit',
                      'value' => get_string('save', 'local_yumymedia'));

        $button = html_writer::empty_tag('input', $attr);

        $attr = array('class' => 'ft');
        $output .= html_writer::tag('div', "<center>$button</center>", $attr);

        $output .= html_writer::end_tag('div');

        return $output;

    }

    /**
     * This function returns YUI TabView HTML markup.
     *
     * @param none.
     * @return string - HTML markup of YUI TabView.
     */
    public function media_details_tabs_markup() {

        $output = '';

        $attr = array('id' => 'id_media_details_tab');

        $output .= html_writer::start_tag('div', $attr);

        $output .= html_writer::start_tag('ul');

        $attr = array('href' => '#preview',
                      'title' => get_string('tab_preview', 'local_yumymedia'));
        $element = html_writer::tag('a', get_string('tab_preview', 'local_yumymedia'), $attr);
        $output .= html_writer::tag('li', $element);

        $attr = array('href' => '#metadata',
                      'title' => get_string('tab_metadata', 'local_yumymedia'));
        $element = html_writer::tag('a', get_string('tab_metadata', 'local_yumymedia'), $attr);
        $output .= html_writer::tag('li', $element);

        $output .= html_writer::end_tag('ul');

        $output .= html_writer::start_tag('div');

        $attr = array('id' => 'preview');
        $output .= html_writer::tag('div', '', $attr);

        $attr = array('id' => 'metadata');
        $output .= html_writer::tag('div', $this->media_metadata_form(), $attr);

        $attr = array('id' => 'embed');
        $output .= html_writer::tag('div', $this->create_embed_markup(), $attr);

        $output .= html_writer::end_tag('div');

        $output .= html_writer::end_tag('div');

        return $output;
    }

    /**
     * This function outputs the media edit metadata elements.
     *
     * @param none.
     * @return string - HTML markup of edit metadata.
     */
    public function media_metadata_form() {
        $output = '';

        $attr = array('id' => 'mymedia_media_metadata_table',
                      'class' => 'mymedia media metadata_table',
                      'border' => 0);

        $output .= html_writer::start_tag('table', $attr);

        $output .= html_writer::start_tag('tr');

        $output .= html_writer::start_tag('td');

        $output .= html_writer::tag('label', get_string('metadata_media_name', 'local_yumymedia'));

        $output .= html_writer::end_tag('td');

        // Add media name text field.
        $attr = array('type' => 'text',
                      'size' => 50,
                      'maxlength' => 150,
                      'id' => 'metadata_media_name',
                      'name' => 'media_name',
                      'class' => 'mymedia media name metadata',
                      'title' => get_string('metadata_media_name', 'local_yumymedia'));

        $output .= html_writer::start_tag('td');

        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr');

        $output .= html_writer::start_tag('td');

        $output .= html_writer::tag('label', get_string('metadata_media_tags', 'local_yumymedia'));

        $output .= html_writer::end_tag('td');

        // Add media tags text field.
        $attr = array('type' => 'text',
                      'size' => 50,
                      'maxlength' => 150,
                      'id' => 'metadata_media_tags',
                      'name' => 'media_tags',
                      'class' => 'mymedia media tags metadata',
                      'title' => get_string('metadata_media_tags', 'local_yumymedia'));

        $output .= html_writer::start_tag('td');

        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr');

        $output .= html_writer::start_tag('td');

        $output .= html_writer::tag('label', get_string('metadata_media_desc', 'local_yumymedia'));

        $output .= html_writer::end_tag('td');

        // Add description text area.
        $attr = array('rows' => '7',
                      'cols' => '50',
                      'id' => 'metadata_media_desc',
                      'name' => 'media_desc',
                      'class' => 'mymedia media desc metadata',
                      'title' => get_string('metadata_media_desc', 'local_yumymedia'));

        $output .= html_writer::start_tag('td');

        $output .= html_writer::tag('textarea', '', $attr);

        // Add hidden element.
        $attr = array('type' => 'hidden',
                      'id' => 'metadata_entry_id',
                      'name' => 'metadata_entry_id');

        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        return $output;

    }

    /**
     * This function outputs the media embed markup.
     *
     * @param none.
     * @return string - HTML markup of the media embed markup.
     */
    public function create_embed_markup() {

        $output = '';
        return $output;
    }

    /**
     * This function outputs the media embed markup.
     *
     * @param none.
     * @return string - HTML markup of simple dialog.
     */
    public function create_simple_dialog_markup() {

        $attr   = array('id' => 'mymedia_simple_dialog');
        $output = html_writer::start_tag('div');

        $attr   = array('class'  => 'hd');
        $output .= html_writer::tag('div', '', $attr);

        $attr   = array('class'  => 'bd');
        $output .= html_writer::tag('div', '', $attr);

        $output .= html_writer::end_tag('div');

        // Tabindex -1 is required in order for the focus event to be capture amongst all browsers.
        $attr = array('id'       => 'notification',
                      'class'    => 'mymedia notification',
                      'tabindex' => '-1');
        $output .= html_writer::tag('div', '', $attr);

        return $output;
    }

    /**
     * This function outputs the media search.
     *
     * @param none.
     * @return string - HTML markup of media search.
     */
    public function create_search_markup() {
        global $SESSION;

        $attr = array('id' => 'simple_search_container',
                      'class' => 'mymedia simple search container');

        $output = html_writer::start_tag('span', $attr);

        $attr = array('method' => 'post',
                      'action' => new moodle_url('/local/yumymedia/yumymedia.php'),
                      'class' => 'mymedia search form');

        $output .= html_writer::start_tag('form', $attr);

        $defaultvalue = (isset($SESSION->mymedia) && !empty($SESSION->mymedia)) ? $SESSION->mymedia : '';
        $attr = array('type' => 'text',
                      'id' => 'simple_search',
                      'class' => 'mymedia simple search',
                      'name' => 'simple_search_name',
                      'value' => $defaultvalue,
                      'title' => get_string('search_text_tooltip', 'local_yumymedia'));

        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden',
                      'id' => 'sesskey_id',
                      'name' => 'sesskey',
                      'value' => sesskey());

        $output .= html_writer::empty_tag('input', $attr);

        $output .= '&nbsp;&nbsp;';

        $attr = array('type' => 'submit',
                      'id'   => 'simple_search_btn',
                      'name' => 'simple_search_btn_name',
                      'value' => get_string('search', 'local_yumymedia'),
                      'class' => 'mymedia simple search button',
                      'title' => get_string('search', 'local_yumymedia'));

        $output .= html_writer::empty_tag('input', $attr);

        $attr   = array('type' => 'submit',
                        'id'   => 'clear_simple_search_btn',
                        'name' => 'clear_simple_search_btn_name',
                        'value' => get_string('search_clear', 'local_yumymedia'),
                        'class' => 'mymedia simple search button clear',
                        'title' => get_string('search_clear', 'local_yumymedia'));

        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::end_tag('form');

        $output .= html_writer::end_tag('span');

        return $output;
    }

    /**
     * This function outputs the media upload.
     *
     * @param none.
     * @return string - HTML markup of media upload.
     */
    public function create_upload_markup() {

        $output = '';
        $output .= '<script>';
        $output .= 'function openSimpleUploader() { location.href="./simple_uploader.php"; }';
        $output .= '</script>';

        $attr = array('id' => 'uploader_open',
                      'class' => 'mymedia simple upload button',
                      'value' => get_string('simple_upload', 'local_yumymedia'),
                      'type' => 'button',
                      'title' => get_string('simple_upload', 'local_yumymedia'),
                      'onClick' => 'openSimpleUploader()');

        $output .= html_writer::empty_tag('input', $attr);

        return $output;

    }

    /**
     * This function outputs the "now loading" panel.
     *
     * @param none.
     * @return string - HTML markup of "now loading".
     */
    public function create_loading_screen_markup() {

        $attr = array('id' => 'wait');
        $output = html_writer::start_tag('div', $attr);

        $attr = array('class' => 'hd');
        $output .= html_writer::tag('div', '', $attr);

        $attr = array('class' => 'bd');

        $output .= html_writer::tag('div', '', $attr);

        $output .= html_writer::end_tag('div');

        return $output;
    }

    /**
     * This function outputs HTML markup for media details.
     *
     * @param object $entry - Kaltura media entry object.
     * @return string - HTML markup of media details.
     */
    public function create_media_details_table_markup($entry) {

        $desc = $entry->description;
        $order = array("\r\n", "\n", "\r");
        $replace = "<br />";

        if ($desc != null && $desc != '') {
            $desc = str_replace($order, $replace, $desc);
        }

        $output = '';

        $attr = array('class' => 'summary_label', 'id' => 'summary_label');
        $output .= html_writer::start_tag('p', $attr);
        $output .= get_string('heading_summary', 'local_yumymedia');
        $output .= html_writer::end_tag('p');
        $attr = array('border' => '2', 'cellspacing' => '2', 'cellpadding' => '4');
        $output .= html_writer::start_tag('table', $attr);

        $output .= html_writer::start_tag('tr');
        $output .= html_writer::start_tag('td');
        $output .= get_string('metadata_media_name', 'local_yumymedia');
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $output .= $entry->name;
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr');
        $output .= html_writer::start_tag('td');
        $output .= get_string('metadata_media_created', 'local_yumymedia');
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $output .= userdate($entry->createdAt);
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr');
        $output .= html_writer::start_tag('td');
        $output .= get_string('metadata_media_tags', 'local_yumymedia');
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $output .= $entry->tags;
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::start_tag('tr');
        $output .= html_writer::start_tag('td');
        $output .= get_string('metadata_media_desc', 'local_yumymedia');
        $output .= html_writer::end_tag('td');
        $output .= html_writer::start_tag('td');
        $output .= $desc;
        $output .= html_writer::end_tag('td');
        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        $output .= html_writer::empty_tag('br');

        return $output;
    }

    /**
     * This function outputs HTML markup for hidden input.
     *
     * @param object $kalturahost - hostname of Kaltura server.
     * @param string $ks - Kaltura session string.
     * @param string $entryid - id of media entyry.
     * @param int $uiconfid - id of embeded player.
     * @param string $sort - sorting option.
     * @param string $url - URL of "My Media".
     * @return string - HTML markup of hidden input.
     */
    public function create_hidden_input_markup($kalturahost, $ks, $entryid, $partnerid, $uiconfid,
                                               $sort, $url, $currentcontrolid) {

        $output = '';

        $attr = array('type' => 'hidden', 'name' => 'kalturahost', 'id' => 'kalturahost', 'value' => $kalturahost);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden', 'name' => 'ks', 'id' => 'ks', 'value' => $ks);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden', 'name' => 'entryid', 'id' => 'entryid', 'value' => $entryid);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden', 'name' => 'partnerid', 'id' => 'partnerid', 'value' => $partnerid);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden', 'name' => 'uiconfid', 'id' => 'uiconfid', 'value' => $uiconfid);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden', 'name' => 'mymedia', 'id' => 'mymedia', 'value' => $url);
        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('type' => 'hidden',
                      'name' => 'currentcontrol',
                      'id' => 'currentcontrol',
                      'value' => $currentcontrolid);
        $output .= html_writer::empty_tag('input', $attr);

        $output .= html_writer::empty_tag('br');

        return $output;
    }

    /**
     * This function outputs HTML markup for media embed.
     *
     * @param none.
     * @return string - HTML markup of embed code.
     */
    public function create_embed_code_markup() {
        $output = '';

        $output .= html_writer::start_tag('p');

        $output .= get_string('heading_link_type', 'local_yumymedia');
        $output .= '&nbsp;&nbsp;';

        $attr = array('class' => 'code_type_select',
                      'id' => 'code_type_select',
                      'onChange' => 'printHtmlCode()'
                     );

        $array = array(0 => get_string('label_embed_code', 'local_yumymedia'),
                       1 => get_string('label_page_url', 'local_yumymedia')
                      );
        $selected = 0;

        $output .= html_writer::select($array, 'code_id', $selected, false, $attr);

        $output .= html_writer::end_tag('p');

        $attr = array('name' => 'codearea',
                      'id' => 'codearea',
                      'cols' => '60',
                      'rows' => '9',
                      'wrap' => 'soft',
                      'spellcheck' => 'false',
                      'readonly' => ''
                    );

        $output .= html_writer::start_tag('textarea', $attr);

        $output .= html_writer::end_tag('textarea');

        $output .= html_writer::empty_tag('br', null);

        return $output;
    }

    /**
     * This function outputs HTML markup for media embed.
     *
     * @param object $defaultcontrol - object of access control (default setting).
     * @param object $internalcontrol - object of access control (internal only).
     * @param object $currentcontrol - object of acecss control (media entry).
     * @return string - HTML markup of embed code.
     */
    public function create_access_control_markup($defaultcontrol, $internalcontrol, $currentcontrolid) {

        $output = '';

        $selected = null;

        if ($currentcontrolid == $internalcontrol->id) {
            $selected = $internalcontrol->id;
        } else {
            $selectd = $defaultcontrol->id;
        }

        $attr = array('class' => 'access_control_label',
                          'id' => 'access_control_label');

        $output .= html_writer::start_tag('p', $attr);

        $output .= get_string('heading_access_control', 'local_yumymedia');

        $output .= html_writer::end_tag('p');

        $array = array($defaultcontrol->id => get_string('default_access_control', 'local_yumymedia'),
                       $internalcontrol->id => get_string('internal_access_control', 'local_yumymedia'));
        $attr = array('class' => 'access_control_select',
                      'id' => 'access_control_select',
                      'onChange' => 'selectedControl()');

        $output .= html_writer::select($array, 'control_id', $selected, false, $attr);

        $output .= html_writer::empty_tag('br');
        $output .= html_writer::empty_tag('br');

        $attr = array('type' => 'button',
                      'id' => 'access_media_save',
                      'name' => 'access_media_save',
                      'value' => 'Save',
                      'disabled' => 'disabled',
                      'onclick' => 'updateAccessControlId()');

        $output .= html_writer::empty_tag('input', $attr);

        $output .= '&nbsp;&nbsp;';

        return $output;
    }

    /**
     * This function outputs HTML markup for back button in access setting page.
     *
     * @param string $url - URL of "My Media".
     * @return string - HTML markup of back button.
     */
    public function create_access_back_markup($url) {
        $output = '';

        $attr = array('type' => 'button',
                      'id' => 'access_media_back',
                      'name' => 'access_media_back',
                      'value' => 'Back',
                      'onclick' => "location.href='$url'");

        $output .= html_writer::empty_tag('input', $attr);

        $attr = array('id' => 'modal_content');
        $output .= html_writer::start_tag('div', $attr);
        $attr = array('align' => 'center');
        $output .= html_writer::start_tag('h3', $attr);
        $output .= 'Updating...';
        $output .= html_writer::end_tag('h3');
        $output .= html_writer::end_tag('div');

        return $output;
    }

    /**
     * This function outputs HTML markup for delete message.
     *
     * @param string $message - delete message string.
     * @param string $mymediaurl - URL of "My Media".
     * @return string - HTML markup of delete message.
     */
    public function create_delete_message_markup($message, $mymediaurl) {
        $output = '';

        $output .= html_writer::start_tag('div');
        $output .= $message;
        $output .= html_writer::end_tag('div');
        $output .= html_writer::empty_tag('br');
        $output .= $this->create_delete_back_button_markup($mymediaurl);

        return $output;
    }

    /**
     * This function outputs HTML markup for back button in media delete page.
     *
     * @param string $mymediaurl - URL of "My Media".
     * @return string - HTML markup of back button.
     */
    public function create_delete_back_button_markup($mymediaurl) {
        $output = '';
        $attr = array('type' => 'button', 'name' => 'delete_media_back',
                      'value' => 'Back',
                      'onclick' => 'location.href=\'' . $mymediaurl . '\'');
        $output .= html_writer::empty_tag('input', $attr);

        return $output;
    }

    /**
     * This function outputs HTML markup for media used table.
     *
     * @param string $entryid - id of media entry.
     * @param string $mymediaurl - URL of "My Media".
     * @param bool $flag - true if the media can delete, otherwise false.
     * @return string - HTML markup of back button.
     */
    public function create_entry_used_table($entryid, $mymediaurl, &$flag) {
        global $DB;

        $output = '';

        $flag = true;

        $dbman = $DB->get_manager();
        if (!($dbman->table_exists('kalmediares'))) {
            return $output;
        }

        if ($resourcearray = $DB->get_records('kalmediares', array('entry_id' => $entryid))) {

            $output .= get_string('media_used', 'local_yumymedia');

            $attr = array('border' => '2', 'cellspacing' => '2', 'cellpadding' => '4');
            $output .= html_writer::start_tag('table', $attr);

            $output .= html_writer::start_tag('tr');
            $output .= html_writer::start_tag('th');
            $output .= 'course shortname';
            $output .= html_writer::end_tag('th');
            $output .= html_writer::start_tag('th');
            $output .= 'course fullname';
            $output .= html_writer::end_tag('th');
            $output .= html_writer::end_tag('tr');

            foreach ($resourcearray as $record) {
                $coursearray = $DB->get_records('course', array('id' => $record->course));
                foreach ($coursearray as $course) {
                    $output .= html_writer::start_tag('tr');
                    $output .= html_writer::start_tag('td');
                    $output .= $course->shortname;
                    $output .= html_writer::end_tag('td');
                    $output .= html_writer::start_tag('td');
                    $output .= $course->fullname;
                    $output .= html_writer::end_tag('td');
                    $output .= html_writer::end_tag('tr');
                }
            }
            $output .= html_writer::end_tag('table');

            $output .= html_writer::empty_tag('br');

            $output .= $this->create_delete_back_button_markup($mymediaurl);

            $flag = false;
        }

        return $output;
    }

    /**
     * This function outputs HTML markup for delete confirmation.
     *
     * @param string $entryid - id of media entry.
     * @param int $page - page number which the media is printed.
     * @param string $sort - sorting option.
     * @param string $mymediaurl - URL of "My Media".
     * @return string - HTML markup of delete confirmation.
     */
    public function create_delete_confirm_markup($entryid, $page, $sort, $mymediaurl) {

        $output = '';

        $output .= html_writer::start_tag('div');
        $output .= get_string('delete_media_confirm', 'local_yumymedia');
        $output .= html_writer::end_tag('div');

        $output .= html_writer::empty_tag('br');

        $output .= html_writer::start_tag('div');

        $attr = array('border' => '0');

        $output .= html_writer::start_tag('table', $attr);

        $output .= html_writer::start_tag('tr');

        $output .= html_writer::start_tag('td');

        $deletemediaurl = new moodle_url('/local/yumymedia/delete_media.php',
                                         array('entryid' => $entryid,
                                               'confirm' => 'Drop',
                                               'page' => $page,
                                               'sort' => $sort)
                                        );

        $attr = array('method' => 'post', 'action' => $deletemediaurl);

        $output .= html_writer::start_tag('form', $attr);

        $attr = array('type' => 'submit', 'name' => 'delete_media_ok', 'value' => 'OK, Delete');

        $output .= html_writer::start_tag('input', $attr);

        $output .= html_writer::end_tag('form');

        $output .= html_writer::end_tag('td');

        $output .= html_writer::start_tag('td');

        $attr = array('type' => 'button', 'name' => 'delete_media_cancel',
                      'value' => 'Cancel',
                      'onclick' => 'location.href=\'' . $mymediaurl . '\''
                     );

        $output .= html_writer::start_tag('input', $attr);

        $output .= html_writer::end_tag('td');

        $output .= html_writer::end_tag('tr');

        $output .= html_writer::end_tag('table');

        $output .= html_writer::end_tag('div');

        return $output;
    }

}
