// smooth scrolling to Apps section
$('.nav-link').click(function(event) {

  let targetHref = $(this).attr('href');
  $('html, body').animate({
    scrollTop: $(targetHref).offset().top - 75
  }, 1000);

  event.preventDefault();
});