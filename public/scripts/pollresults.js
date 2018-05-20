$(function(){
  moment().format();
  if(moment(data.deadline).isSameOrBefore(moment())) {
    $('.ending-time').html("Poll ended <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
  } else {
    $('.ending-time').html("Poll ends <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> from now on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
  }

  if(localStorage.getItem(data._id)){
    $(".vote-link-btn").hide();
  };

  //DELETE Poll
    $("#delete-form").on("submit", function(e){
      return confirm('Delete the poll "' +  data.title + '"?"');
    })

  $('.share-popover').popover({
    container: 'body',
    trigger: 'click',
    placement: 'top',
    html: true,
    content: function () {
      console.log($(this).html());
      console.log("Test");
      return $('.popper-content').html();
    },
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-body"></div></div>',
  });

  $("body").on("click", ".social-links a", function(e){
    e.preventDefault();
    var share_link = $(this).prop('href');
    window.open(share_link, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=600,height=400");
  });

  $('body').on("click", ".popover button.copy-poll-link", function(){
    var copyText = document.querySelector(".popover input.poll-link");
    copyText.select();
    document.execCommand("copy");
  });


  $('body').on('click', function (e) {
      $('[data-toggle="popover"]').each(function () {
          //the 'is' for buttons that trigger popups
          //the 'has' for icons within a button that triggers a popup
          if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
              $(this).popover('hide');
          }
      });
  });
});
