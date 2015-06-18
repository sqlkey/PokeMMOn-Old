$(function() {

    var newWorldTimer;

    // Fetch world list
    updateWorldList();

    // Disable Save and Delete buttons if selectedIndex is 0
    $("#worlds").change(function() {
        hideDeleteWorld();
        if ($("#worlds")[0].selectedIndex == 0) {
            $("#deleteWorld").prop("disabled", true);
        } else {
            $("#deleteWorld").prop("disabled", false);

            // Load in map data
            $.get("editor/world/" + $("#worlds").val(), function(data) {
                console.log(data);
            }).fail(function() {
                console.log("Error retrieving data");
            });
        }
    });

    // Reveal new world input slide down
    $("#newWorld").click(function() {
        hideDeleteWorld();
        $("#newWorldSection").slideDown("medium", function() {
            $("#newWorldInput").focus();
        });
    })

    // Delete world
    $("#deleteWorld").click(function() {
        hideNewWorld();
        $("#deleteWorldText").html("Are you sure you want to delete world " + $("#worlds").val() + "?");
        $("#deleteWorldSection").slideDown("medium");
    })

    // Delete world no
    $("#deleteWorldNo").click(function() {
        hideDeleteWorld();
    })

    // Delete world yes
    $("#deleteWorldYes").click(function() {
        $.ajax({
            url: 'editor/world/' + $("#worlds").val(),
            type: 'DELETE',
            success: function(result) {
                hideDeleteWorld();
                updateWorldList(function() {
                    $("#worlds").val("");
                    $("#deleteWorld").prop("disabled", true);
                });
            }
        });
    })

    // Cancel new world slide down if escape is pressed
    $('#newWorldInput').keyup(function(e) {
        if (e.keyCode == 27){
            hideNewWorld();
        }
    });

    $('#newWorldSave').click(function() {
        var name = $("#newWorldInput").val();
        $.post("editor/world", {name: name, data: JSON.stringify({})}, function(data) {
            // success
            hideNewWorld();

            updateWorldList(function() {
                $("#worlds").val(name);
                $("#deleteWorld").prop("disabled", false);
            });

        }).fail(function() {
            // fail
        });
    });

    // Wait for user's input 250 ms before querying for valid name
    $('#newWorldInput').keyup(function() {
        clearTimeout(newWorldTimer);
        newWorldTimer = setTimeout(queryNewWorld, 50);
    });

    $('#newWorldInput').keydown(function() {
        clearTimeout(newWorldTimer);
    });

    function queryNewWorld() {
        var worldName = $("#newWorldInput").val();

        if (worldName != "") {
            $.get("editor/world/", function(data) {
                if (data.indexOf(worldName) != -1) {
                    $("#newWorldSave").addClass("red").removeClass("green").prop("disabled", true);
                } else {
                    $("#newWorldSave").addClass("green").removeClass("red").prop("disabled", false);
                }
            });
        } else {
            $("#newWorldSave").removeClass("green").removeClass("red").prop("disabled", true);
        }
    }

    function updateWorldList(callback) {
        $.get("editor/world", function(data) {
            worlds = data;

            // Update world select with world options
            $('#worlds')
                .empty()
                .append($("<option></option>")
                .attr("value", "")
                .text("--- Select a world ---"));

            $.each(data, function(key, value) {
                $('#worlds')
                    .append($("<option></option>")
                    .attr("value", value)
                    .text(value));
            });

            $('#worlds').prop("disabled", false);

            typeof callback === 'function' && callback();
        });
    }

    function hideNewWorld() {
        $("#newWorldSection").slideUp("medium", function() {
            $("#newWorldSave").removeClass("green").removeClass("red").prop("disabled", true);
            $("#newWorldInput").val("");
        });
    }

    function hideDeleteWorld() {
        $("#deleteWorldSection").slideUp("medium", function() {
            $("#deleteWorldText").html("");
        });
    }
});
