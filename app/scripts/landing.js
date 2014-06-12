$(document).ready(function() {
  $('.hero-content h3').click( function() {
    subText = $(this).text();
    $(this).text(subText + '!');
  });

  var heroOnHover = function() {
    $(this).animate({color:'#B27AFF'}, 700);
  };
  var heroOffHover = function() {
    $(this).animate({color:'#FFFFFF'}, 700);
  };

  $('.hero-content h3').hover(heroOnHover, heroOffHover);

  var onHoverAction = function() {
    console.log('Hover action triggered');
    $(this).animate({'margin-top':'10px'})
  };
  var offHoverAction = function() {
    console.log('Off hover action triggered');
    $(this).animate({'margin-top':'0px'});
  };

  $('.selling-points .point').hover(onHoverAction, offHoverAction);
});