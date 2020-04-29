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
 * YU Kaltura "My Media" callback script.
 *
 * @package    local_yumymedia
 * @copyright  (C) 2016-2020 Yamaguchi University (gh-cc@mlex.cc.yamaguchi-u.ac.jp)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

M.local_yumymedia = {

    Y: null,
    transaction: {},

    /**
     * Initial function.
     * @access public
     * @param {object} Y - YUI object.
     * @param {string} panelMarkup - HTML markup of panel.
     * @param {string} dialog - HTML markup of dialog.
     * @param {string} conversionScript - URL of conversion script.
     * @param {string} saveMediaScript - URL of save media script.
     * @param {string} uiconfid - UiConf id on Kaltura server.
     * @param {string} loadingPanel - URL of loading panel.
     * @param {int} editMeta - capability for edit metadata.
     */
    init: function(Y, panelMarkup, dialog, conversionScript, saveMediaScript,
                    uiconfid, loadingPanel, editMeta) {

        var bodyNode = Y.one("#page-mymedia-index");

        bodyNode.append(dialog);

        dialog = new Y.YUI2.widget.SimpleDialog("mymedia_simple_dialog", {
            width: "20em",
            effect: {
                effect: Y.YUI2.widget.ContainerEffect.FADE,
                duration: 0.30
            },
            fixedcenter: true,
            modal: true,
            constraintoviewport: true,
            visible: false,
            draggable: true,
            iframe: true,
            close: false,
            context: ["region-main", "tl", "tl", ["beforeShow", "windowResize"], [250, 20]]
        });

        dialog.render("page-mymedia-index");

        if (null === Y.one("#mymedia_medias")) {
            return;
        }

        bodyNode.append(panelMarkup);
        bodyNode.append(loadingPanel);

        // Create Loading panel.
        loadingPanel = new Y.YUI2.widget.Panel("wait", {
            width: "240px", fixedcenter: true, close: false, draggable: false, zIndex: 100, modal: true, visible: false
        });

        loadingPanel.setHeader("Loading, please wait...");
        loadingPanel.setBody('<img src="../../local/yukaltura/pix/rel_interstitial_loading.gif" />');
        loadingPanel.render();

        // Create preview panel.
        var detailsPanel = new Y.YUI2.widget.Panel("id_media_details", {
            width: "550px", height: "550px", fixedcenter: false, constraintoviewport: true, dragable: false,
            visible: false, close: true, modal: true, zIndex: 50,
            context: ["region-main", "tl", "tl", ["beforeShow", "windowResize"]]
        });

        detailsPanel.render();

        // Create the tab view.
        var tabView = new Y.TabView({
            srcNode: '#id_media_details_tab', visible: false, width: "500px", height: "460px"
        });

        tabView.render();

        // Subscribe to the hideEvent for the panel,
        // so that the flash player will be removed when the panel is closed.
        detailsPanel.hideEvent.subscribe(function() {

            // Clear the enbedded player.
            tabView.item(0).set('content', '');

            // Clear the metadata.
            var metadata = Y.one('#metadata_media_name');
            metadata.set('value', '');

            metadata = Y.one('#metadata_media_tags');
            metadata.set('value', '');

            metadata = Y.one('#metadata_media_desc');
            metadata.set('value', '');

            window.location.href = window.location.href;
        });

        var checkConversionStatus = {
            complete: function check_conversion_status(id, o) {

                // If the response text is empty then the media must still be converting.
                if ('' == o.responseText) {
                    tabView.item(0).set('content', M.util.get_string("media_converting", "local_yumymedia"));
                } else {

                    // Parse the response text.
                    var data = Y.JSON.parse(o.responseText);

                    // Set the media preview tab content to the embed markup.
                    if (undefined !== data.markup) {

                        // Set tab content.
                        tabView.item(0).set('content', '<center>' + data.markup + '</center>');

                        // Set Metadata content.
                        var metadataName = Y.one('#metadata_media_name');
                        metadataName.set('value', data.name);

                        var metadataTags = Y.one('#metadata_media_tags');
                        metadataTags.set('value', data.tags);

                        var metadataDesc = Y.one('#metadata_media_desc');
                        metadataDesc.set('value', data.description);

                        if (undefined !== data.script) {
                            (Function.call(null, data.script))();
                        }

                        // Disable edit tab if the user doesn't have the capability.
                        if (1 != editMeta) {
                            metadataName.set('disabled', true);
                            metadataTags.set('disabled', true);
                            metadataDesc.set('disabled', true);
                        }

                        // Lastly if they have no capabilities then disable the save button.
                        if (1 != editMeta) {
                            Y.one('#id_media_details_save').set('disabled', true);
                        } else {
                            Y.one('#id_media_details_save').set('disabled', false);
                        }

                    }
                }

                loadingPanel.hide();
            }
        };

        // Set configuration object for KDP asynchronous call.
        var previewCfg = {
            on: {complete: checkConversionStatus.complete
            },
            context: checkConversionStatus
        };

        var saveMediaInformation = {
            complete: function saveMediaInformation(id, o) {

                var returnValue = o.responseText.split(" ");

                if ('y' != returnValue[0]) {

                    dialog.setHeader(M.util.get_string("failure_saved_hdr", "local_yumymedia"));
                    dialog.cfg.setProperty("icon", Y.YUI2.widget.SimpleDialog.ICON_WARN);

                    switch (returnValue[1]) {
                        case "1":
                        case "3":
                        case "4":
                        case "5":
                        case "6":
                        case "8":
                        case "9":
                        case "10":
                            dialog.cfg.setProperty("text",
                                                   M.util.get_string("error_saving", "local_yumymedia") +
                                                   " ERROR " + returnValue[1]);
                            break;
                        case "2":
                            dialog.cfg.setProperty("text", M.util.get_string("missing_required", "local_yumymedia"));
                            break;
                        case "7":
                            dialog.cfg.setProperty("text", M.util.get_string("error_not_owner", "local_yumymedia"));
                            break;
                        default:
                            dialog.cfg.setProperty("text", M.util.get_string("error_saving", "local_yumymedia"));
                            break;
                    }
                } else {
                    dialog.setHeader(M.util.get_string("success_saving_hdr", "local_yumymedia"));
                    dialog.cfg.setProperty("icon", Y.YUI2.widget.SimpleDialog.ICON_INFO);
                    dialog.cfg.setProperty("text", M.util.get_string("success_saving", "local_yumymedia"));
                }

                // Add okay button to dialog.
                var button = [{
                    text: M.util.get_string("continue", "local_yumymedia"),
                    handler: function closeDialog() {
                        detailsPanel.hide();
                        this.hide();
                    },
                    isDefault: true}];

                dialog.cfg.setProperty("buttons", button);

                // Re-enable the save button.
                Y.one('#id_media_details_save').set('disabled', false);

                loadingPanel.hide();
                dialog.show();
            }
        };

        // Set configuration object for saving asynchronous call.
        var saveCfg = {
            on: {
                complete: saveMediaInformation.complete
            },
            context: saveMediaInformation
        };

        // Subscribe to the save button click.
        var saveButton = Y.one('#id_media_details_save');

        saveButton.on('click', function(e) {
            // Disable the save button until the asynchronous calls returns.
            e.target.set('disabled', true);

            loadingPanel.show();

            // Save all of the metadata items.
            var entryid = Y.one('#metadata_entry_id').get('value');
            var name = Y.one('#metadata_media_name').get('value');
            var tags = Y.one('#metadata_media_tags').get('value');
            var desc = Y.one('#metadata_media_desc').get('value');

            var url = encodeURI(saveMediaScript + entryid + "&name=" + name + "&tags=" + tags + "&desc=" + desc);
            Y.io(url, saveCfg);
        });

        // Get the table element.
        var mediaList = Y.one('#mymedia_medias');
        // Create event delegation.
        mediaList.delegate('click', function(e) {
            if ('mymedia media delete' == this.getAttribute('class')) {
                // Do nothing.
                return '';
            }

            if ('mymedia media access' == this.getAttribute('class')) {
                // Do nothing.
                return '';
            }

            if ('mymedia media download' == this.getAttribute('class')) {
                // Do nothing.
                return '';
            }

            e.preventDefault();

            var entryid = this.ancestor('div.mymedia.media.entry').getAttribute('id');

            // Disable the submit button while the asynchronous call is being processed.
            Y.one('#id_media_details_save').set('disabled', true);

            Y.io(conversionScript + entryid + "&" + "width=400&" + "height=400&" + "uiconf_id=" + uiconfid, previewCfg);

            // Display the panel and display the tab.
            detailsPanel.show();
            tabView.show();

            // Display loading panel.
            loadingPanel.show();

            var metadata = Y.one('#metadata_entry_id');
            metadata.set('value', entryid);

            // Retrieve the class of the element that was clicked.
            var buttonClass = this.getAttribute('class');

            // Check which element was specifically clicked and select a default tab to open.
            if (-1 != buttonClass.search("preview")) {
                tabView.selectChild(0);

            } else if (-1 != buttonClass.search("edit")) {
                tabView.selectChild(1);

            } else if (-1 != buttonClass.search("embed")) {
                tabView.selectChild(2);
            }

            return '';
        }, 'a');

        var mymediasort = Y.one("#mymediasort");
        var mymediasortoptions = mymediasort.get("options");
        Y.on("change", function() {
            var index = mymediasort.get("selectedIndex");
            var url = mymediasortoptions.item(index).get("value");
            window.location.href = url;
        }, mymediasort);
    }
};
