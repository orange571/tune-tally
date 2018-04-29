$(document).ready(function(){
  // HIDE OR SHOW LOGIN OPTIONS
  $('#enforce-login').click(function() {
    $('#login-options').toggle(this.checked);
  });
  $('#all-login').click(function(){
        $('.login-option').prop('checked', this.checked);
  })
  $('.login-option').click(function(){
    if ($('#all-login').is(':checked')){
      $('#all-login').prop('checked', false);
    }
  })

  //HIDE/SHOW SPOTIFY ENFORCED
    $('#open-add').click(function() {
      $('.content-container--spotify-enforced').toggle(this.checked);
    });


  //DEADLINE SETUP
  moment().format();
  setDeadineValue('day');
  $('#ends').on("change", function(e){
    var valueSelected = this.value;
    if(valueSelected == "custom-deadline") {
      $('#form-group--deadline').show();
      $("input[name='deadline']").prop('disabled', false);
      $("input[name='deadline']").prop('required', true);
    } else {
      setDeadineValue(valueSelected);
      $("input[name='deadline']").prop('disabled', true);
      $("input[name='deadline']").removeAttr('required');
      $("input[name='deadline']").focus().blur();
    }
  });
  function setDeadineValue (unit) {
    if($("input[name='deadline']").attr('type') === 'text') {
      console.log(moment().add(1,unit).format('MM/DD/YYYY hh:mmA'));
      $("input[name='deadline']").val(moment().add(1,unit).format('MM/DD/YYYY hh:mmA'))
    }else if($("input[name='deadline']").attr('type') === 'datetime-local') {
      $("input[name='deadline']").val(moment().add(1,unit).format('YYYY-MM-DDTHH:mm'))
    }
  }

  //SUBMIT HANDLER
  $("#create-poll").on("submit", function(e){
    e.preventDefault();
    if($("#create-poll").valid()){
      var result = {};
      result.title = $('#title').val();
      if($('#ends').val() === "custom-deadline"){
        if($("input[name='deadline']").attr('type') === 'text') {
          result.deadline = moment($("input[name='deadline']").val()).format('MM/DD/YYYY hh:mmA').toISOString();
        }else if($("input[name='deadline']").attr('type') === 'datetime-local') {
          result.deadline = moment($("input[name='deadline']").val()).format('YYYY-MM-DDTHH:mm').toISOString();
        }
      } else {
        result.deadline = moment().add(1,$('#ends').val()).toISOString();
      }
      result.maxVotes = parseInt($('input[name="max-votes"]').val());
      result.openAdd = $('#open-add')[0].checked;
      result.spotifyEnforced = $('#open-add')[0].checked;
      result.enforceLogin = $('#enforce-login')[0].checked;
      result.loginOptions = $("#login-options input:checkbox:checked").map(function(){
                              return $(this).val();
                            }).get();
      alert(JSON.stringify(result));
      console.log(result);
      console.log(JSON.stringify(result));
      $.ajax({
        type: "POST",
        timeout: 2000,
        url: 'http://localhost:3000/polls/createpoll',
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
    }
  })

  //VALIDATION
  $.validator.addMethod("dateTime", function (value, element) {
      var validMoment = moment(value, 'YYYY-MM-DDTHH:mm', true).isValid() || moment(value, 'MM/DD/YYYY hh:mmA', true).isValid();
      return this.optional(element) || (validMoment);
  }, "Please enter a valid date and time.");

  $.validator.addMethod("future", function (value, element) {
      var validMoment = moment(value, 'YYYY-MM-DDTHH:mm', true).isValid() || moment(value, 'MM/DD/YYYY hh:mmA', true).isValid();
      var isAfterNow = moment(value, 'YYYY-MM-DDTHH:mm', true).isAfter(moment()) || moment(value, 'MM/DD/YYYY hh:mmA', true).isAfter(moment());
      return this.optional(element) || (validMoment && isAfterNow);
  }, "Please enter a valid date in the future.");

  $("#create-poll").validate({
    rules: {
      'title': {
        maxlength: 250
      },
      'max-votes': {
        required: true,
        min: 0,
        digits: true,
      },
      'deadline': {
        dateTime: true,
        future: true
      }
    },
    errorPlacement: function(error, element) {
       error.insertAfter(element);
     }
  });
});
