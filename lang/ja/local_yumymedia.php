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
 * Language file for "My Media".
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2019 Yamaguchi University <gh-cc@mlex.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'マイメディア';

// Capability strings.
$string['yumymedia:view'] = 'マイメディアページを表示する。';
$string['yumymedia:search'] = 'アップロード済みのメディアを検索する。';
$string['yumymedia:editmetadata'] = 'メディアのメタデータを編集する。';
$string['yumymedia:upload'] = 'メディアをアップロードする。';
$string['yumymedia:delete'] = 'アップロード済みのメディアを削除する。';
$string['yumymedia:download'] = 'アップロード済みのメディアをダウンロードする。';
$string['yumymedia:clip'] = 'メディアのクリップを作成する。';

// Navigation block.
$string['nav_mymedia'] = 'マイメディア';
$string['nav_upload'] = 'アップロード';

// Heading.
$string['heading_mymedia'] = 'マイメディア';

// Video actions.
$string['preview_link'] = 'プレビュー';
$string['share_link'] = '共有';
$string['edit_link'] = '編集';
$string['clip_link'] = 'クリップ';
$string['delete_link'] = '削除';
$string['download_link'] = 'ダウンロード';
$string['access_link'] = 'アクセス';

// Media details panel.
$string['details'] = 'メディアの詳細';

// Media details tabs.
$string['tab_preview'] = 'プレビュー';
$string['tab_metadata'] = '編集';
$string['tab_share'] = '共有';
$string['tab_embed'] = '埋め込み';
$string['metadata_media_name'] = '名前: ';
$string['metadata_media_tags'] = 'タグ: ';
$string['metadata_media_desc'] = '説明: ';
$string['metadata_media_created'] = '作成: ';
$string['media_converting'] = 'メディアはまだ変換中です。しばらくしてからもう一度お試しください。';
$string['loading'] = '読み込み中です。お待ちください。';
$string['scr_loading'] = '読み込み中です。';
$string['save'] = '保存して終了';
$string['missing_required'] = 'メディアの名前を入力してください。';
$string['error_saving'] = '設定の保存中にエラーが発生しました。<br>システム管理者に連絡してください。';
$string['error_not_owner'] = 'あなたはメディアの所有者ではありません。<br>メディアの所有者であればシステム管理者に連絡してください。';
$string['success_saving_hdr'] = '保存されました';
$string['success_saving'] = 'メディアの設定が正常に保存されました。';
$string['failure_saved_hdr'] = '設定は保存されませんでした';
$string['check_all'] = 'すべてを選択';
$string['site_share'] = 'サイト全体で共有';
$string['media_error'] = 'メディアの処理途中でエラーが発生しました。<br>他のメディアでお試しください。';
$string['media_bad'] = 'このメディアは使用しないでください。';
$string['media_retrival_error'] = 'メディアの取得中にエラーが発生しました。<br>もう一度お試しください。';
$string['converting'] = 'メディアは変換中です';
$string['internal'] = '内部限定';
$string['continue'] = '続ける';

// Deleting a media.
$string['delete_media_title'] = 'メディアの削除';
$string['delete_media_hdr'] = 'メディアを削除しようとしています。';
$string['delete_media_confirm'] = '本当にこのメディアを削除しますか？<br>いったん削除されたメディアは復旧できません。';
$string['delete_media_complete'] = 'メディアは削除されました。';
$string['delete_media_failed'] = 'メディアの削除に失敗しました。';
$string['delete_media_failed_not_owner'] = '自分の所有していないメディアを削除することはできません。<br>あなたがメディア所有者である場合はシステム管理者に連絡してください。';
$string['delete_media_not_exist'] = 'このメディアはもう存在しません。';

// Media Upload.
$string['simple_upload'] = 'メディアのアップロード';
$string['webcam_upload'] = 'Webカメラからのアップロード';
$string['pc_only'] = 'PC限定';
$string['pc_recommended'] = 'PCを推奨';
$string['session_failed'] = 'メディアをアップロードするためのKalturaセッションを開始できません。<br>システム管理者に連絡してください。';
$string['category_failed'] = 'コンテンツのルートカテゴリを設定できません。';
$string['category_failed_empty'] = '設定ページでルートカテゴリを設定してください。';
$string['category_failed_no_exists'] = 'Kalturaサーバにルートカテゴリが存在しません。';
$string['ks_failed'] = 'Kalturaセッションを設定できません。';
$string['uploader_hdr'] = 'メディア・アップローダー';
$string['webcam_hdr'] = 'Webカメラ・アップローダー';
$string['upload_form_hdr'] = 'メディア・アップロード・フォーム';
$string['webcam_form_hdr'] = 'Webカメラ録画フォーム';
$string['required_field'] = '必須項目';
$string['name_header'] = '名前';
$string['tags_header'] = 'タグ';
$string['desc_header'] = '説明';
$string['comma_separated'] = '半角カンマ区切り';
$string['select_file_exp'] = 'メディアのファイルを選択してください。';
$string['webcam_recording_exp'] = '動画を録画してください。';
$string['fill_form_exp'] = 'メタデータ(属性情報)を入力してファイルを送信してください。';
$string['upload_success_hdr'] = 'アップロードの成功';
$string['upload_success'] = 'メディアのアップロードに成功しました。';
$string['uploading_header'] = 'アップロード中';

// Buttons.
$string['ok_label'] = 'はい';
$string['save_label'] = '保存';
$string['upload_label'] = 'アップロード';
$string['cancel_label'] = 'キャンセル';
$string['reset_label'] = 'リセット';
$string['back_label'] = '戻る';
$string['okdelete_label'] = '削除する';

// Search.
$string['search'] = '検索';
$string['search_clear'] = 'クリア';
$string['search_text_tooltip'] = 'メディアの名前やタグを入力してください。';

// Trouble.
$string['problem_viewing'] = 'ページの表示中に問題が発生しました。システム管理者に連絡してください。';
$string['no_medias'] = 'メディアが見つかりません。';
$string['permission_disable'] = 'あなたにはマイメディアを使用する権限がありません。';
$string['webcam_disable'] = 'あたなにはWebカメラを使用する権限がありません。';

// Sorting.
$string['sortby'] = '並べ替え';
$string['mostrecent'] = '新しい順';
$string['oldest'] = '古い順';
$string['medianameasc'] = '名前順 (辞書順)';
$string['medianamedesc'] = '名前順 (逆順)';

// Delete media.
$string['media_used'] = '指定のメディアは以下のコースで使用されています。<br>このメディアを削除することはできません。';

// Access Control.
$string['access_media_title'] = 'リンクとアクセス制御';
$string['default_access_control_failed'] = '標準のアクセス制御が存在しません。<br>';
$string['default_access_control'] = '標準';
$string['internal_access_control'] = '内部限定';
$string['access_control'] = 'アクセス制御';
$string['heading_summary'] = '概要';
$string['heading_link_type'] = 'リンクタイプ';
$string['label_embed_code'] = '埋め込みコード';
$string['label_page_url'] = 'ページURL';
$string['heading_access_control'] = 'アクセス制御';
$string['access_media_failed_not_owner'] = '所有していないメディアにはアクセスできません。<br>あなたがメディアの所有者である場合はシステム管理者に連絡してください。';
$string['access_media_not_exist'] = 'このメディアはもう存在しません。';
