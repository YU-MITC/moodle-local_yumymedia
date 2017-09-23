M.local_yumymedia = {};

M.local_yumymedia.init_config = function (Y, panel_markup, dialog, conversion_script, save_media_script,
                                        uiconfid, loading_panel, edit_meta,
                                        kaltura_partner_id, kaltura_session) {

    var body_node = Y.one("#page-mymedia-index");

    body_node.append(dialog);

    dialog = new Y.YUI2.widget.SimpleDialog("mymedia_simple_dialog", {
        width: "20em",
        effect:{
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

    if (null == Y.one("#mymedia_medias")) {
        return '';
    }

    body_node.append(panel_markup);
    body_node.append(loading_panel);

    // Create Loading panel.
    loading_panel = new Y.YUI2.widget.Panel("wait", {
        width:"240px", fixedcenter:true, close:false, draggable:false, zIndex:100, modal:true, visible:false
    });

    loading_panel.setHeader("Loading, please wait...");
    loading_panel.setBody('<img src="../../local/yukaltura/pix/rel_interstitial_loading.gif" />');
    loading_panel.render();

    // Create preview panel.
    var details_panel = new Y.YUI2.widget.Panel("id_media_details", {
        width: "550px", height: "550px", fixedcenter: false, constraintoviewport: true, dragable: false,
        visible: false, close: true, modal: true, zIndex: 50,
        context: ["region-main", "tl", "tl", ["beforeShow", "windowResize"]]
    });

    details_panel.render();

    // Create the tab view.
    var tab_view = new Y.TabView({
        srcNode:'#id_media_details_tab', visible: false, width: "500px", height: "480px"
    });

    tab_view.render();

    // Subscribe to the hideEvent for the panel,
    // so that the flash player will be removed when the panel is closed.
    details_panel.hideEvent.subscribe(function() {

        // Clear the enbedded player.
        tab_view.item(0).set('content', '');

        // Clear the metadata.
        var metadata = Y.one('#metadata_media_name');
        metadata.set('value', '');

        metadata = Y.one('#metadata_media_tags');
        metadata.set('value', '');

        metadata = Y.one('#metadata_media_desc');
        metadata.set('value', '');

        window.location.href = window.location.href;
    });

    var check_conversion_status = {
        complete: function check_conversion_status (id, o) {

            // If the response text is empty then the media must still be converting.
            if ('' == o.responseText) {
                tab_view.item(0).set('content', M.util.get_string("media_converting", "local_yumymedia"));
            } else {

                // Parse the response text.
                var data = Y.JSON.parse(o.responseText);

                // Set the media preview tab content to the embed markup.
                if (undefined !== data.markup) {

                    // Set tab content.
                    tab_view.item(0).set('content', '<center>' + data.markup + '</center>');

                    // Set Metadata content.
                    var metadata_name = Y.one('#metadata_media_name');
                    metadata_name.set('value', data.name);

                    var metadata_tags = Y.one('#metadata_media_tags');
                    metadata_tags.set('value', data.tags);

                    var metadata_desc = Y.one('#metadata_media_desc');
                    metadata_desc.set('value', data.description);

                    if (undefined !== data.script) {
                        eval(data.script);
                    }

                    // Disable edit tab if the user doesn't have the capability.
                    if (1 != edit_meta) {
                        metadata_name.set('disabled', true);
                        metadata_tags.set('disabled', true);
                        metadata_desc.set('disabled', true);
                    }

                    // Lastly if they have no capabilities then disable the save button.
                    if (1 != edit_meta) {
                        Y.one('#id_media_details_save').set('disabled', true);
                    } else {
                        Y.one('#id_media_details_save').set('disabled', false);
                    }

                }
            }

            loading_panel.hide();
        }
    };

    // Set configuration object for KDP asynchronous call.
    var preview_cfg = {
        on: {complete: check_conversion_status.complete
        },
        context: check_conversion_status
    };

    var save_media_information = {
        complete: function save_media_information (id, o) {

            var return_value = o.responseText.split(" ");

            if ('y' != return_value[0]) {

                dialog.setHeader(M.util.get_string("failure_saved_hdr", "local_yumymedia"));
                dialog.cfg.setProperty("icon", Y.YUI2.widget.SimpleDialog.ICON_WARN);

                switch (return_value[1]) {
                    case "1":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "8":
                    case "9":
                    case "10":
                        dialog.cfg.setProperty("text", M.util.get_string("error_saving", "local_yumymedia") + " ERROR " + return_value[1]);
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
            var button = [ {
                text: M.util.get_string("continue", "local_yumymedia"),
                handler: function close_dialog() { details_panel.hide(); this.hide(); },
                isDefault: true
            } ];

            dialog.cfg.setProperty("buttons", button);

            // Re-enable the save button.
            Y.one('#id_media_details_save').set('disabled', false);

            loading_panel.hide();
            dialog.show();
        }
    };

    // Set configuration object for saving asynchronous call.
    var save_cfg = {
        on: { complete: save_media_information.complete},
        context: save_media_information
    };

    // Subscribe to the save button click.
    var save_button = Y.one('#id_media_details_save');

    save_button.on('click', function(e) {
        // Disable the save button until the asynchronous calls returns.
        e.target.set('disabled', true);

        loading_panel.show();

        // Save all of the metadata items.
        var entryid = Y.one('#metadata_entry_id').get('value');
        var name = Y.one('#metadata_media_name').get('value');
        var tags = Y.one('#metadata_media_tags').get('value');
        var desc = Y.one('#metadata_media_desc').get('value');

        var url = encodeURI(save_media_script + entryid + "&name=" + name + "&tags=" + tags + "&desc=" + desc);
        Y.io(url, save_cfg);
    });

    // Get the table element.
    var media_list = Y.one('#mymedia_medias');
    // Create event delegation.
    media_list.delegate('click', function(e) {
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

        Y.io(conversion_script + entryid + "&" + "width=400&" + "height=400&" + "uiconfid=" + uiconfid, preview_cfg);

        // Display the panel and display the tab.
        details_panel.show();
        tab_view.show();

        // Display loading panel.
        loading_panel.show();

        var metadata = Y.one('#metadata_entry_id');
        metadata.set('value', entryid);

        // Retrieve the class of the element that was clicked.
        var button_class = this.getAttribute('class');

        // Check which element was specifically clicked and select a default tab to open.
        if (-1 != button_class.search("preview")) {
            tab_view.selectChild(0);

        } else if (-1 != button_class.search("edit")) {
            tab_view.selectChild(1);

        } else if (-1 != button_class.search("embed")) {
            tab_view.selectChild(2);
        }

    }, 'a');

    var mymediasort = Y.one("#mymediasort");
    var mymediasortoptions = mymediasort.get("options");
    Y.on("change", function () {
        var index = mymediasort.get("selectedIndex");
        var url = mymediasortoptions.item(index).get("value");
        window.location.href = url;
    }, mymediasort);
};
