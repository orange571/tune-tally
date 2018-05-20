$(function(){
  moment().format();
  setupPoll(data);
  var newSongCounter = -1; //first song will have index of 0
  var newSongs = [];

  function setupPoll (data) {
    $('.ending-time').html("Poll ends <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> from now on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
  }

  function addUserSubmittedSongToPoll () {
    newSongCounter += 1;
    var song = {}
    song.artist = $("#add-artist").val().trim();
    song.title = $("#add-title").val().trim();
    song.id = newSongCounter;
    newSongs.push(song);
    id = newSongCounter;
    var msg = "";
    $(".registered-songs .empty-error").remove();
    $('.user-submitted-songs').addClass('end-list');
    $('.registered-songs').removeClass('end-list');
    msg += "<div class='song-item row'>";
    msg += "<div class='song-item-info row'><div class='col-md-5'>" + song.artist + "</div><div class='col-md-7'>" + song.title + "</div></div>";
    msg += "<div class='remove-container'><button class='btn btn-danger btn-sm remove-song'>Remove</button></div></div>";
    $('.user-submitted-songs').append(msg);
  }

  function processUserAddedSong () {
    if($('#add-song-form').valid()){
      addUserSubmittedSongToPoll();
      $("#add-artist").val("");
      $("#add-title").val("");
      $('#add-artist').focus();
      $('.form--viewpoll input').typeahead('val', '');
    } else {
      console.log('form not valid')
    }
  }

  $("#add-song").on("click", function(e){
    e.preventDefault();
    processUserAddedSong();
    return false;
  });

  $('#add-song-form').on("keyup", function(e){
    if(e.keyCode == 13) {
      e.preventDefault();
      processUserAddedSong();
    }
  });

  $(".user-submitted-songs").on("click", '.remove-song', function(){
    var songId = $(this).parent().parent().attr("data-newSongId");
    $(this).parent().parent().remove();
    for (var i = 0; i < newSongs.length; i++) {
      if(parseInt(songId) === newSongs[i].id) {
        newSongs.splice(i,1);
      }
    }
    if($('.user-submitted-songs .song-item').length < 1){
      $('.user-submitted-songs').removeClass('end-list');
      $('.registered-songs').addClass('end-list');
      $(".registered-songs").html('<div class="empty-error">No songs in this poll for now</div>');
    }
  });



    //SUBMIT HANDLER
    $('#initialize-poll').on("submit", function(e) {
      e.preventDefault();
      var result = {};
      result.newSongs = newSongs;
      alert(JSON.stringify(result));
      $('#submit-poll').append("<div id='loader-overlay'><img src='/images/transparent-loader.gif' alt='loader'></div>");
      $.ajax({
        type: "POST",
        timeout:25000,
        url: 'http://localhost:3000/polls/initializepoll/' + data._id,
        data: JSON.stringify(result),
        success: function(data) {
          if (data.status === "Success") {
              window.location = data.redirect;
          }
        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err)
        },
        contentType: 'application/json',
      });
      return false;
    })

    $('body').on("click", ".share-url-button", function(){
      var copyText = document.querySelector("#share-url");
      copyText.select();
      document.execCommand("copy");
    });

    //REMOVE Song
    $(".remove-song").on("click", function(e) {
      e.preventDefault();
      var songId = $(this).attr("data-songId");
      console.log("songId", songId);
      $(this).append("<div id='loader-overlay'><img src='/images/transparent-loader.gif' alt='loader'></div>");
      $.ajax({
        type: "DELETE",
        timeout: 25000,
        url: 'http://localhost:3000/polls/' + data._id + '/song/' + songId,
        success: function(data) {
          if (data.status === "Success") {
              window.location.reload();
          } else if (data.status === "Error") {
            alert(JSON.Stringify(data.error));
            window.location.reload();
          }
        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err)
        },
        contentType: 'application/json',
      });
    })

    // Instantiate the Bloodhound suggestion engine
    var artists = new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        wildcard: '%QUERY',
        url: 'http://localhost:3000/artist?key=%QUERY',
        transform: function(artists) {
          console.log(artists);
          // Map the remote source JSON array to a JavaScript object array
          return $.map(artists, function (artist) {
            console.log(artist.name);
              return {
                  value: artist.name
              };
          });
        }
      }
    });

    // Instantiate the Typeahead UI
    $('#add-artist').typeahead(null, {
      display: 'value',
      source: artists
    });

    var titles = new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        prepare: function(query, settings) {
          var artistSetting = ($("#add-artist").val() !== "" ? "%20artist:"+$("#add-artist").val() : "")
          settings.url += 'track:' + query + artistSetting;
          console.log("settings");
          console.log(settings);
          return settings;
        },
        url: 'http://localhost:3000/title?key=',
        transform: function(titles) {
          console.log(titles);
          // Map the remote source JSON array to a JavaScript object array
          return $.map(titles, function (title) {
            console.log(title.artists);
              return {
                  value: title.name,
                  artist: title.artists[0].name
              };
          });
        }
      }
    });

    // Instantiate the Typeahead UI
    $('#add-title').typeahead(null, {
      display: 'value',
      source: titles,
      limit: Infinity,
      templates: {
          suggestion: function(item) { return "<p>" + item.artist + " - <b>" + item.value + "</b></p>"; },
          footer: function(query) { return "<p class='typeahead-footer'><b>Searched for '" + query.query + "'</b></p>" }
      }
    });
    $('#add-title').bind('typeahead:select', function(ev, suggestion) {
      $('#add-artist').val(suggestion.artist);
    });

    //VALIDATION
    $.validator.addMethod("noDuplicates", function (value, element) {
        var titleValue = value.toLowerCase().trim();
        var registeredSongs = data.songs;
        var noDupesInRegistered = true;
        var noDupesInAdded = true;
        for (var i = 0; i < registeredSongs.length; i++) {
          if(registeredSongs[i].title.toLowerCase() === titleValue && $('input[name="add-artist"]').val().toLowerCase().trim() === registeredSongs[i].artist.toLowerCase()) {
            noDupesInRegistered = false
          }
        }
        for (var i = 0; i < newSongs.length; i++) {
          if(newSongs[i].title.toLowerCase() === titleValue && $('input[name="add-artist"]').val().toLowerCase().trim() === newSongs[i].artist.toLowerCase()) {
            noDupesInAdded = false;
          }
        }
        return this.optional(element) || (noDupesInRegistered && noDupesInAdded);
    }, "This song already exists in the poll");

    var addSongValidator = $("#add-song-form").validate({
      rules: {
        "add-artist": "required",
        "add-title": {
          required: true,
          noDuplicates: true,
        }
      },
      errorPlacement: function(error, element) {
         error.insertAfter(element);
       }
    });
});
