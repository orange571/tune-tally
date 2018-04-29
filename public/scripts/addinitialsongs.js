$(function(){
  var songs = [];
  console.log(songs);
  function printSongs () {
    if(songs.length === 0){
      $('.song-list').html("<div class='empty-error'>No songs in this poll for now</div>");
      console.log(songs);
    } else {
      console.log(songs);
      var msg = "";
      var artist = "";
      var title = "";
      for (var i=0; i<songs.length; i++) {
        artist = songs[i].artist;
        title = songs[i].title;
        msg += "<div class='song-item row'>";
        msg += "<div class='song-item-info row'><div class='col-md-5'>" + artist + "</div><div class='col-md-7'>" + title + "</div></div>";
        msg += "<div class='remove-container'><button class='btn btn-danger btn-sm remove-song'>Remove</button></div></div>";
      }
      $('.song-list').html(msg);
      $('.song-list').animate({scrollTop: $('.song-list').prop("scrollHeight")}, 500);
    }
  }
  function addSong () {
    var song = {}
    song.artist = $("#add-artist").val();
    song.title = $("#add-title").val();
    songs.push(song);
    printSongs();
  }
  function removeSong (i) {
    songs.splice(i,1);
    printSongs();
  }

  printSongs();

  function processAddSong () {
    if($('#add-song-form').valid()){
      addSong();
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
    console.log("submit");
    processAddSong();
  });

  $('#add-song-form').on("keyup", function(e){
    if(e.keyCode == 13) {
      e.preventDefault();
      processAddSong();
    }
  });


  $(".song-list").on("click", '.remove-song', function(){
    var index = $('.song-list').index($(this).parent());
    console.log("removing...", index);
    removeSong(index);
  });

  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  $('.form--viewpoll input').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'states',
    source: substringMatcher(states)
  });

  var addSongValidator = $("#add-song-form").validate({
    rules: {
      "add-artist": "required",
      "add-title": "required"
    },
    errorPlacement: function(error, element) {
       error.insertAfter(element);
     }
  });
});
