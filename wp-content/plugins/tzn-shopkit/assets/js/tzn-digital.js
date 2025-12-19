jQuery(document).ready(function ($) {

    const sticky_footer_checkout = parseInt(tzn_dgt.sticky_footer_checkout, 10);

    function top_bar() {
        if ($(window).width() <= 849) {
            let topBarSlider = $("#top-bar .mobile-nav .contact-info");
            if (topBarSlider.length) {
                $("#top-bar .mobile-nav .contact-info").addClass('slider-loaded');
                topBarSlider.on('ready.flickity', function () {
                    //$("#top-bar .mobile-nav .contact-info").addClass('slider-loaded')
                });
                topBarSlider.flickity({
                    pageDots: false,
                    freeScroll: false,
                    wrapAround: true,
                    prevNextButtons: false,
                    percentPosition: true,
                    autoPlay: true,
                    groupCells: true
                });
                topBarSlider.lazyFlickity({
                    pageDots: false,
                    freeScroll: false,
                    wrapAround: true,
                    prevNextButtons: false,
                    percentPosition: true,
                    autoPlay: true,
                    groupCells: true
                });
            }
        }
    }

    top_bar();

    function footer_slider() {
        if ($(window).width() <= 850) {
            $('#footer .is-divider').remove();
            $("#footer ul.sidebar-wrapper, #footer .footer-1 > .row").accordion({
                header: ".widget-title",
                heightStyle: "content",
                collapsible: true,
                active: false
            });
        }
    }

    footer_slider();

    //cart
    function auto_update_cart() {
        $(document).on('change', '.cart_item .quantity select', function () {
            $('button[name="update_cart"]').attr('disabled', false);
            $('button[name="update_cart"]').click();
        })
    }

    if ($('body').hasClass('woocommerce-cart')) auto_update_cart();

    $(document).on('click', '.coupon .widget-title', function () {
        $(this).closest('.coupon-code-wrapper').toggleClass('open');
        //$(this).next().slideToggle();
    });

    //mini-cart
    function tzn_apply_coupon() {

        //offcanvas cart
        $(document).on('click', '.coupon-code-wrapper .apply-coupon', function (e) {
            e.preventDefault();
            var button = $(this);
            var code = button.closest('.coupon-code-wrapper').find('#coupon_code').val();

            var data = {
                action: 'apply_coupon',
                coupon_code: code,
                security: (typeof tzn_dgt.apply_coupon_nonce !== 'undefined') ? tzn_dgt.apply_coupon_nonce : '',
                coupon_action: 'add'
            };
            if (!code) {
                $('.coupon-code-wrapper .result').html('<div class="text-error">' + tzn_dgt.enter_code_error_msg + '</div>')
                return false;
            }
            $.post(tzn_dgt.tzn_ajax_url, data, function (returned_data) {
                $('.coupon-code-wrapper .result').html('');
                //$('.coupon-code-wrapper .result').html('<div class="text-' + returned_data.result + '">' + returned_data.message + '</div>');
                if ($('body.woocommerce-checkout').length) {
                    $(document.body).trigger('update_checkout');
                } else if ($('body.woocommerce-cart').length) {
                    $(document.body).trigger('wc_update_cart');
                } else {
                    $(document.body).trigger('wc_fragment_refresh');
                }
            });
        });
    }

    function tzn_remove_coupon() {
        $(document).off(
            'click',
            'a.woocommerce-remove-coupon',
        );
        $(document).on('click', '.cart_totals .woocommerce-remove-coupon', function (e) {
            e.preventDefault();
            var button = $(this);
            var code = button.data('coupon');

            var data = {
                action: 'apply_coupon',
                coupon_code: code,
                security: (typeof tzn_dgt.remove_coupon_nonce !== 'undefined') ? tzn_dgt.remove_coupon_nonce : '',
                coupon_action: 'remove',
            };
            $.post(tzn_dgt.tzn_ajax_url, data, function (returned_data) {
                $('.coupon-code-wrapper .result').html('');
                //$('.coupon-code-wrapper .result').html('<div class="text-' + returned_data.result + '">' + returned_data.message + '</div');
                if (returned_data.result === 'success') {
                    if ($('body.woocommerce-checkout').length) {
                        $(document.body).trigger('update_checkout');
                    } else if ($('body.woocommerce-cart').length) {
                        $(document.body).trigger('wc_update_cart');
                    } else {
                        $(document.body).trigger('wc_fragment_refresh');
                    }
                }
            });
        });
    }

    function tzn_clear_coupon_messages() {
        $('.coupon-code-wrapper .tzn-coupon-messages').css('display', 'none');
        $('.coupon-code-wrapper .tzn-coupon-messages div.result').html('');
    }

    // if (!$('body.woocommerce-cart').length) {
    tzn_clear_coupon_messages();
    tzn_remove_coupon();
    tzn_apply_coupon();

    function free_shipping_slider() {

        let current_amount_left = $('.range-slider .range-filled').data('amount-left'),
            total = $('.range-slider .range-filled').data('total') * 1,
            free_shipping = (current_amount_left > 0 ? total + current_amount_left : false);
        var slider_width = 100;

        if (free_shipping) {

            var slider_width = ((current_amount_left / free_shipping) * 100),
                slider_width = 100 - slider_width;
            $('.range-slider .range-filled').css('width', slider_width + '%');
        }
        $('.range-slider .range-filled').css('width', slider_width + '%');

    }

    function toggle_shipping_calc_offcanvas_cart() {
        $('#cart-popup').on('click', '.shipping-calculator-button', function () {
            $(this).next().slideToggle();
        })
    }

    toggle_shipping_calc_offcanvas_cart();
    // if ($('.free-shipping-amount-left-container').length) {
    //     free_shipping_slider();
    //     $(document.body).on('updated_cart_totals', function (event) {
    //         free_shipping_slider()
    //     });
    // }

    function remove_duplicated_cart_totals() {
        //TBD - works atm
        $(document).on('updated_cart_totals', function () {
            if ($('.cart-sidebar .cart_totals').length > 1) {
                $('.cart-sidebar .cart_totals').slice(1).remove();
            }
        });
    }

    remove_duplicated_cart_totals();

    /* New variations shop loop */
    $('body:not(.single) table.variations .variable-item').click(function () {
        var self = $(this),
            url = self.closest('.product').find('.product-title a').attr('href'),
            price_wrapper = self.closest('.product').find('.price-wrapper'),
            variations_wrapper = self.closest('.product').find('.variations-wrapper');
        $(document).on('found_variation', function (event, variation) {
            var variation_price = variation.price_html;
            //if there is a button shown
            if (variations_wrapper.find('.add_to_cart_button').length) {
                price_wrapper.html(variation_price);
            } else {
                var attr_value = self.data('value'),
                    attr_name = self.closest('.variable-items-wrapper').data('attribute_name');
                window.location.href = url + '?' + attr_name + '=' + attr_value + '';
            }
        });
    });

    /* Bundle update price */
    function bundle_quantity_fix() {
        let bundle_id = $('input[name="add-to-cart"]').val(),
            bundle = wc_pb_bundle_scripts[bundle_id];
        bundle.$bundle_price = $('.product-page-price, .bundle_price');
        bundle.$bundle_quantity = $('.bundle_button .quantity select');
        bundle.$bundle_data.trigger('woocommerce-product-bundle-update');
        //bundled item
        $('.bundled_products .bundled_product').each(function () {
            let quantity = $(this).find('.quantity select option:selected').val(),
                index = $(this).index();
            bundle.bundled_items[index].get_quantity = function () {
                return parseInt(quantity);
            }
            bundle.$bundle_data.trigger('woocommerce-product-bundle-update', bundle.bundled_items[index]);
        });
        $('.bundled_product .quantity select').on('change', function () {
            let quantity = $(this).find('option:selected').val(),
                index = $(this).closest('.bundled_product').index();
            bundle.bundled_items[index].get_quantity = function () {
                return parseInt(quantity);
            }
            bundle.$bundle_data.trigger('woocommerce-product-bundle-update', bundle.bundled_items[index]);
        });
        $('.bundle_button .quantity select').on('change', function () {
            let quantity = $(this).find('option:selected').val();
            bundle.get_quantity = function () {
                return parseInt(quantity);
            }
            //bundle.$bundle_data.trigger('woocommerce-product-bundle-update');
        });
    }

    setTimeout(function () {
        if ($('.bundled_product .quantity select').length) {
            bundle_quantity_fix();
        }
    }, 500);

    function convert_svg_to_html() {
        jQuery('img.svg').each(function () {
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
            jQuery.get(imgURL, function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');
                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass + ' replaced-svg');
                }
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
                if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                    $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
                }
                // Replace image with new SVG
                $img.replaceWith($svg);
            }, 'xml');
        });
    }

    convert_svg_to_html();

    function close_mini_cart_dropdown() {
        $(document).on('click', '.cart-title .fa-times', function () {
            $('.cart-item.has-dropdown.current-dropdown').removeClass('current-dropdown')
        });
    }

    close_mini_cart_dropdown();

    $(document.body).on('updated_cart_totals', function () {
        const data = new FormData();
        data.append('action', 'tzn_get_cart_total');
        data.append('gift_max_total', $('.gift-container .progress-bar').attr('data-max-price'));
        const ajax = tzn_dgt_ajax(data);

        ajax.done(function (response) {
            if (typeof response === 'object') {
                if (response.success) {
                    $('.gift-container .progress-bar .current-progress').css({'width': response.progress + '%'});
                    $('.gift-container .progress-bar .current-progress').attr('data-price', response.cart_total);
                    if (parseFloat(response.free_shipping_amount_left, 10) > 0) {
                        $('.loyalty-free-shipping-amount-left').show();
                        $('.loyalty-free-shipping-amount-left .loyalty-free-shipping-amount-left-value').text(response.free_shipping_amount_left);
                    } else {
                        $('.loyalty-free-shipping-amount-left').hide();
                    }
                    //console.log(response.cart_total);
                    //Cookies.set('woocommerce_cart_total', response.cart_total, { expires: 30, sameSite: 'strict' });
                    // $('.quantity.buttons_added .qty').trigger('change');
                    // console.log(fragments['div.widget_shopping_cart_content']);
                } else {
                    console.log(response.message);
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        });
    });

    loyaltyGiftsAdjustment();

    function loyaltyGiftsAdjustment() {
        if ($('#loyalty-cart .gift-name').length) {
            console.log(new Date());
            $('#loyalty-cart .gift-name').each(function (i, v) {
                $(v).css({
                    'left':'-' + $(v).width() + 'px'
                });
            });
        }
    }

    /* replace 1px base64 encoded img with original images --start */
    function tzn_replace_placeholders() {
        const tzn_1px_images = $('[data-tzn-src]:not(.tzn-lazy-loaded)');
        if (tzn_1px_images.length) {
            $(tzn_1px_images).each(function (i, v) {
                $(v).attr('src', $(v).attr('data-tzn-src')).addClass('tzn-lazy-loaded');
            });
        }
    }

    tzn_replace_placeholders();

    $(window).on('resize scroll', function () {
        tzn_replace_placeholders();
    });

    $(document.body).on('updated_checkout applied_coupon_in_checkout', function () {

        if (!sticky_footer_checkout) {
            return;
        }

        tzn_replace_placeholders();

        const data = new FormData();
        data.append('action', 'update_sticky_footer');
        const ajax = tzn_dgt_ajax(data);

        ajax.done(function (response) {
            if (typeof response === 'object') {
                if (response.success) {
                    $('.sticky-submit-order-holder .woocommerce-Price-amount').replaceWith(response.cart_total_html);
                } else {
                    console.log(response.message);
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        });
    })

    /* replace 1px base64 encoded img with original images --end */

    function tzn_dgt_ajax(data) {
        return $.ajax({
            type: "POST",
            url: tzn_dgt.tzn_ajax_url,
            data: data,
            contentType: false,
            processData: false
        });
    }
});
