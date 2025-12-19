
jQuery(document).ready(function($) {
    $('.faq-title').on('click', function() {
        var content = $(this).next('.faq-text-desc');
        
        if (content.is(':visible')) {
            content.slideUp(200);
            $(this).removeClass('active');
        } else {
            $('.faq-text-desc').slideUp(200);
            $('.faq-title').removeClass('active');
            content.slideDown(200);
            $(this).addClass('active');
        }
    });
});
