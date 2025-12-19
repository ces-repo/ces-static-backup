jQuery(document).ready(function ($) {
    let tzn_doing_ajax = false;
    const tzn_autoupdate_method = tzn_mc.tzn_autoupdate_method;

    /**
     * mini-cart auto - update --start
     */
    $(document).on('change', '.tzn-mini-cart-quantity', tzn_delay(function (e) {
        e.preventDefault();
        if (tzn_doing_ajax) {
            console.log('Update is in progress already! Try a bit later please!');
            return false;
        }

        const elem = $(this);
        const cart_item_key = elem.attr('data-cart_item_key');
        const product = parseInt(elem.attr('data-product'), 10);
        let quantity = parseInt(elem.val(), 10);
        let quantity_step = parseInt(elem.attr('step'), 10);
        const quantityMin = parseInt(elem.attr('min'), 10);
        const quantityMax = parseInt(elem.attr('max'), 10);
        const currency = $.trim(elem.attr('data-currency'));
        let shipping = elem.closest('.widget_shopping_cart').find('.shipping_method:checked').val();

        if (!shipping || typeof shipping === 'undefined') {
            shipping = '';
        }

        if (isNaN(quantity) || (typeof quantity === 'undefined') || quantity < 1) {
            console.log('Invalid quantity data: ' + quantity);
            return;
        } else if (isNaN(product) || (typeof product === 'undefined') || !product) {
            console.log('Invalid product data: ' + product);
            return;
        }

        if (quantity % quantity_step !== 0) {
            console.log('Invalid quantity');
            return;
        }


        if (quantityMax != -1 && quantity > quantityMax) {
            elem.val(quantityMax);
            quantity = quantityMax;

            tzn_minicart_notification(elem, 'Max purchase quantity exceed!', 3000);
            return;
        }

        if (quantityMin != -1 && quantity < quantityMin) {
            elem.val(quantityMin);
            quantity = quantityMin;

            tzn_minicart_notification(elem, 'Minimum purchase quantity is ' + quantityMin, 3000);
            return;
        }

        const is_mini_cart = $('.widget_shopping_cart_content').length ? 1 : 0;

        let ajax = null;

        if (tzn_autoupdate_method === 'rest') {
            let data = {
                cart_item_key: cart_item_key,
                product: product,
                quantity: quantity,
                currency: currency,
                shipping: shipping,
                is_mini_cart: is_mini_cart
            };
            console.log(data);
            ajax = tzn_get_minicart_rest_ajax(data);
        } else {
            const data = new FormData();
            data.append('action', 'tzn_minicart_autoupdate');
            data.append('cart_item_key', cart_item_key);
            data.append('product', product);
            data.append('quantity', quantity);
            data.append('currency', currency);
            data.append('shipping', shipping);
            data.append('is_mini_cart', is_mini_cart);
            ajax = tzn_get_minicart_ajax(data);
        }

        tzn_run_processes(elem);
        ajax.done(function (response) {
            tzn_reset_processes();
            if (typeof response === 'object') {
                if (response.success) {
                    if (is_mini_cart) {
                        $('.widget_shopping_cart_content').html(response.mini_cart);
                        $('[data-icon-label]').attr('data-icon-label', response.cart_contents_count);
                        $('.header-cart-link .cart-icon.image-icon strong').text(response.cart_contents_count);
                        $('.header-cart-link .cart-price').html(response.cart_contents_total);
                        $(document.body).trigger('tzn_updated_minicart');
                    } else {
                        $(document.body).trigger('update_checkout');
                    }
                } else {
                    console.log(response.message);
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            tzn_reset_processes();
        });
    }, 1000));

    $(document).on('click', '.tzn-quantity-update', function (e) {
        e.preventDefault();
        const elem = $(this);
        const action_type = $.trim(elem.val());
        const quantity = elem.parents('.quantity-updater').children('.tzn-mini-cart-quantity');
        let quantity_value = parseInt(quantity.val(), 10);
        let quantity_step = parseInt(quantity.attr('step'), 10);
        quantity_step = (isNaN(quantity_step) || (typeof quantity_step === 'undefined') || !quantity_step) ? 1 : quantity_step;
        const quantityMax = parseInt(quantity.attr('max'), 10);

        if (quantity_value < 1 || isNaN(quantity_value) || quantity_value === 'undefined') {
            return;
        }

        if (action_type === '-') {
            if (quantity.val() > 1) {
                quantity.val(quantity_value - quantity_step).trigger('change');
            }
        } else if (action_type === '+') {
            quantity.val(quantity_value + quantity_step).trigger('change');
        }
    });

    $(document).on('change', '.widget_shopping_cart .shipping_method', function (e) {
        const elem = $(this);
        const quantities = elem.closest('.widget_shopping_cart').find('.tzn-mini-cart-quantity');
        $(quantities[quantities.length - 1]).trigger('change');
    });

    function tzn_minicart_notification(elem, msg, timeout) {
        const wrapper = elem.closest('.woocommerce-mini-cart-item.mini_cart_item');
        let err = $('<div class="alert-color tzn-minicart-error">' + msg + '</div>');
        err.css({
            'position': 'absolute',
            'background-color': '#fefefe',
            'z-index': '9999',
            'bottom': '0',
            'left': '0',
        });
        wrapper.append(err);
        setTimeout(function () {
            $(wrapper).find('.tzn-minicart-error').remove();
        }, timeout);
    }

    function tzn_delay(callback, ms) {
        let timeout_id = 0;
        return function () {
            let context = this, args = arguments;
            clearTimeout(timeout_id);
            timeout_id = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    function tzn_reset_processes(elem) {
        tzn_doing_ajax = false;
        const isMiniCart = $('.widget_shopping_cart_content').length;
        if (isMiniCart) {
            $(elem).closest('li.mini_cart_item.processing').removeClass('processing');
        } else {
            $(elem).closest('.product-info.processing').removeClass('processing');
        }
    }

    function tzn_run_processes(elem) {
        tzn_doing_ajax = true;
        const isMiniCart = $('.widget_shopping_cart_content').length;
        if (isMiniCart) {
            $(elem).closest('li.mini_cart_item').addClass('processing');
        } else {
            $(elem).closest('.product-info').addClass('processing');
        }

    }

    function tzn_get_minicart_ajax(data) {
        return $.ajax({
            type: 'POST',
            url: tzn_mc.tzn_ajax_url,
            data: data,
            contentType: false,
            processData: false
        });
    }

    function tzn_get_minicart_rest_ajax(data) {
        return $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-WP-Nonce", tzn_mc.tzn_rest_nonce);
            },
            type: "GET",
            url: tzn_mc.tzn_rest_url,
            data: data
        });
    }

    /**
     * mini-cart auto - update --end
     */
});