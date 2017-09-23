var createObjectURL
= window.URL && window.URL.createObjectURL ? function(file) { return window.URL.createObjectURL(file); }
    : window.webkitURL && window.webkitURL.createObjectURL ? function(file) { return window.webkitURL.createObjectURL(file); }
        : undefined;

var revokeObjectURL
= window.URL && window.URL.revokeObjectURL ? function(file) { return window.URL.revokeObjectURL(file); }
    : window.webkitURL && window.webkitURL.revokeObjectURL ? function(file) { return window.webkitURL.revokeObjectURL(file); }
        : undefined;
/*
 * Entry unload callback.
 */
window.unload = function() {
    sessionEnd();
};

/*
 * This function closed session to kaltura server.
 */
function sessionEnd()
{
    var server_host = $("#kaltura_host").val();
    var serviceURL = server_host + '/api_v3/service/session/action/end';

    // Transmits data.
    $.ajax ({
        type : "GET",
        url : serviceURL,
        cache : false
    })
    .done(function( xmlData ) {
        // When format of response is not XML.
        if (xmlData === null) {
            // Do nothing.
        }
        else {
            // Do nothing.
        }
    })
    .fail(function( xmlData ) {
        // Do nothing.
    });
}
