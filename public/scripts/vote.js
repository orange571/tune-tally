$(function(){
  moment().format();
  setupPoll(data);
  var newSongCounter = -1; //first song will have index of 0
  var newSongs = [];

  function setupPoll (data) {
    $('.ending-time').html("Poll ends <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> from now on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
    printRemainingVotes(data.maxVotes - $('.form--submitvote input[type="checkbox"]:checked').length)
  }

  function printRemainingVotes(numVotes) {
    if (numVotes === 1) {
      $('.votes-remaining').text("You have " + numVotes + " vote remaining");
    } else {
      $('.votes-remaining').text("You have " + numVotes + " votes remaining");
    }
  }

  function addUserSubmittedSongToPoll () {
    newSongCounter += 1;
    var song = {}
    song.artist = $("#add-artist").val().trim();
    song.title = $("#add-title").val().trim();
    song.checked = false;
    song.id = newSongCounter;
    newSongs.push(song);
    id = newSongCounter;
    var msg = "";
    $(".registered-songs .empty-error").remove();
    $('.user-submitted-songs').addClass('end-list');
    $('.registered-songs').removeClass('end-list');
    msg += "<div class='song-item row' data-newSongId='"+newSongCounter+"'>";
    msg += "<div class='custom-control custom-checkbox'>";
    msg += "<input type='checkbox' class='custom-control-input' id='"+id+"'>";
    msg += "<label for='"+id+"' class='song-item-info row custom-control-label'>";
    msg += "<div class='col-md-4'>"+song.artist+"</div><div class='col-md-7'>"+song.title+"</div></label></div>";
    msg += "<div class='remove-container'><button class='btn btn-danger btn-sm remove-song'>Remove</button></div></div>"
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
    updateVotesRemaining();
    if($('.user-submitted-songs .song-item').length < 1){
      $('.user-submitted-songs').removeClass('end-list');
      $('.registered-songs').addClass('end-list');
      $(".registered-songs").html('<div class="empty-error">No songs in this poll for now</div>');
    }
  });


  //UPDATE VOTES REMAINING
  function updateVotesRemaining(input) {
    if($('.form--submitvote input[type="checkbox"]:checked').length > data.maxVotes) {
      input.checked = false
      $('.votes-remaining').addClass('error');
      $('.votes-remaining').text("You have reached the max number of votes allowed on this poll. Please remove a check from one of your previous choices before checking on another song")
    } else {
      var numVotes = data.maxVotes - $('.form--submitvote input[type="checkbox"]:checked').length;
      printRemainingVotes(numVotes);
      $('.votes-remaining').removeClass('error');
    }
  }

  $('.form--submitvote').on("change", 'input[type="checkbox"]', function() {
    updateVotesRemaining(this);
  })

//POPULATE WHETHER SONGS IS CHECKED IN newSongs ARRAY
  $('.user-submitted-songs').on("change", 'input[type="checkbox"]', function() {
    var songId = $(this).attr("id");
    for (var i = 0; i < newSongs.length; i++) {
        if(parseInt(songId) === newSongs[i].id) {
          newSongs[i].checked = this.checked;
        }
    }
  })

  //SUBMIT HANDLER
  $('#submit-vote').on("submit", function(e) {
    e.preventDefault();
    if ($('.form--submitvote input[type="checkbox"]:checked').length < 1 ) {
      $('.votes-remaining').addClass('error');
      $('.votes-remaining').text("You must select at least 1 song before submitting");
    }else {
      var result = {};
      result.votes = $('.form--submitvote input[type="checkbox"]:checked').map(function(){
        return $(this).attr('id');
      }).get();
      result.registeredVotes = $('.registered-songs input[type="checkbox"]:checked').map(function(){
        return $(this).attr('id');
      }).get();
      result.newSongs = newSongs;
      result.now = moment().toISOString();
      //alert(JSON.stringify(result));
      $('#submit-vote').append("<div id='loader-overlay'><img src='/images/transparent-loader.gif' alt='loader'></div>");
      $.ajax({
        type: "POST",
        timeout:25000,
        url: '/polls/' + data._id + '/vote',
        data: JSON.stringify(result),
        success: function(successResult) {
          if (successResult.status === "Success") {
            if(!data.enforceLogin){
              localStorage.setItem(data._id, true);
            }
            window.location = successResult.redirect;
          }
        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err)
        },
        contentType: 'application/json',
      });
    }
    return false;
  })

//DELETE Poll
  $("#delete-form").on("submit", function(e){
    return confirm('Delete the poll "' +  data.title + '"?"');
  })

  //REMOVE Song
  $(".remove-song").on("click", function(e) {
    e.preventDefault();
    var songId = $(this).attr("data-songId");
    $(this).append("<div id='loader-overlay'><img src='/images/transparent-loader.gif' alt='loader'></div>");
    $.ajax({
      type: "DELETE",
      timeout: 25000,
      url: '/polls/' + data._id + '/song/' + songId,
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
      url: '/artist?key=%QUERY',
      transform: function(artists) {
        // Map the remote source JSON array to a JavaScript object array
        return $.map(artists, function (artist) {
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
        var artistSetting = ($("#add-artist").val() !== "" ? "&artist="+$("#add-artist").val() : "")
        settings.url += 'track=' + query + artistSetting;
        return settings;
      },
      url: '/title?',
      transform: function(titles) {
        // Map the remote source JSON array to a JavaScript object array
        return $.map(titles, function (title) {
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
        footer: function(query) { return "<p class='typeahead-footer'><b>Searched for '" + query.query + "'</b>" + ($("#add-artist").val() ? " by " + $("#add-artist").val() : "") + "</p>" }
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
