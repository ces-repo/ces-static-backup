jQuery(document).ready(function ($) {

    let tzn_search_in_process = false;
    let lastRequest = null;

    function delay(callback, ms) {
        var timeout_id = 0;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timeout_id);
            timeout_id = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    $(document).on('click', '.tzn-ls-item', function (e) {
        e.preventDefault();
        const elem = $(this);
        const container = elem.parents('.tzn-ls-shortcode-wrap');
        const search_area = container.attr('data-area');

        if (search_area && search_area === 'admin-gift-field') { // livesearch is used for gift field
            const gift_parent = elem.parents('.tzn-gift-product');
            const product_id = parseInt(elem.attr('data-id'), 10);
            const product_title = $.trim(elem.attr('data-title'));
            const product_price = parseInt(elem.attr('data-price'), 10);
            const product_image = $.trim(elem.attr('data-image'));


            let product_image_bg = 'url("' + product_image + '")';
            console.log(product_image_bg);

            $('.tzn-gift-product-id', gift_parent).val(product_id).removeAttr('disabled');
            $('.tzn-live-search', gift_parent).val(product_title);
            $('.tzn-gift-product-price', gift_parent).val(product_price);
            $('.tzn-live-search', gift_parent).css('background-image', product_image_bg);
            console.log(product_price);

        } else {
            const url = $.trim(elem.attr('data-url'));
            if (!url.length || url === 'undefined') {
                return;
            }
            $('.tzn-live-search', container).val('');
            window.location.href = url;
        }
        $('.tzn-ls-items').remove();

    });

    $('.tzn-live-search').each(function (i, v) {
        $(v).attr('data-search', '');
    });

    $(window).resize(function () {
        $('.tzn-live-search').each(function (i, v) {
//            const ls_items = $(v).parents('.tzn-ls-shortcode-wrap').children('.tzn-ls-items');
            tzn_ls_position_and_dimensions($(v));
        });
    });

    $(document).on('keyup', '.tzn-live-search', delay(function (e) {
        e.preventDefault();
        const elem = $(this);
        const container = elem.parents('.tzn-ls-shortcode-wrap');
        const search_area = container.attr('data-area');
        const search = $.trim(elem.val());
        const search_length = search.length;
        const search_previous = $.trim(elem.attr('data-search'));
        const search_method = $.trim(elem.attr('data-request-method'));

        // prevent the request if search input text value is not changed
        if (search_previous === 'undefined' || search === search_previous) {
            return;
        }

        elem.attr('data-search', search);

        if (search_length >= 3) {

            // abort the request if user still typing
            if (lastRequest !== null) {
                lastRequest.abort();
                lastRequest = null;
            }

            let cache = tzn_get_cache(search);
            console.log('TODO : {caching}');
            //console.log(cache);
            if (cache.suggestions !== null) {
                tzn_show_result(search, cache);
                return;
            }

            let request = null;

            const search_data = {'search': search, 'area': search_area};

            if (search_method === 'ajax') {
                request = tzn_ls_ajax_request(elem, search_data);
            } else {
                request = tzn_ls_rest_request(elem, search_data);
            }

            if (request !== null) {

                lastRequest = request;

                request.done(function (response) {

                    if (typeof response === 'object') {
                        tzn_show_result(elem, search, response);
                    }

                    tzn_reset_processes();

                }).fail(function (jqXHR, textStatus, errorThrown) {
//                    console.log(errorThrown);
                    tzn_reset_processes();
                });
            }
        } else {
            $('.tzn-ls-items').remove();
        }
    }, 100));

    function tzn_set_cache(search, response) {
        if (tzn_ls.tzn_cache) {
            localStorage.setItem(search, response.suggestions);
        }
    }

    function tzn_get_cache(search) {
        let cache = {suggestions: null};
        if (tzn_ls.tzn_cache) {
            cache['suggestions'] = localStorage.getItem(search);
        }
        return cache;
    }

    function tzn_show_result(elem, search, response) {
        $('.tzn-ls-items').remove();

        if (response.suggestions) {

            tzn_set_cache(search, response);

            elem.parents('.tzn-ls-shortcode-wrap').append(response.suggestions);

            tzn_ls_position_and_dimensions(elem);


        }
    }

    function tzn_ls_position_and_dimensions(elem) {
        const offsets = elem.offset();

        if (offsets) {
            const elemTop = Math.ceil(offsets.top);
            const elemLeft = Math.ceil(offsets.left);
            const elemHeight = Math.ceil(elem.outerHeight());
            const elemWidth = Math.ceil(elem.outerWidth());


            elem.parents('.tzn-ls-shortcode-wrap').children('.tzn-ls-items').css({
                //'left': elemLeft + 'px',
                //'top': (elemTop + elemHeight + 1) + 'px',
                'width': elemWidth + 'px'
            });
        }
    }

    $(document).on("click", function (e) {
        const tzn_ls_wrap = $('.tzn-ls-shortcode-wrap');
        $('.tzn-ls-shortcode-wrap').each(function (i, v) {
            if (!($(v)[0].contains(e.target))) {
                $('.tzn-ls-items', v).remove();
            }
        });
    });

    function tzn_ls_rest_request(elem, search_data) {
        let request = null;
        if (tzn_search_in_process) {
            console.log("REST in process");
        } else {
            const data = {'s': search_data['search'], 'area': search_data['area']};
            request = tzn_get_ls_rest_ajax(elem, data);
        }
        return request;
    }

    function tzn_ls_ajax_request(elem, search_data) {
        let request = null;
        if (tzn_search_in_process) {
            console.log("AJAX in process");
        } else {
            const data = new FormData();
            data.append('action', 'tzn_livesearch');
            data.append('s', search_data['search']);
            data.append('area', search_data['area']);
            request = tzn_get_ls_ajax(elem, data);
        }
        return request;
    }

    function tzn_reset_processes() {
        tzn_search_in_process = false;
        $('.tzn-spinner-eclipse').css({'display': 'none'});
    }


    function tzn_get_ls_ajax(elem, data) {
        elem.parents('.tzn-ls-shortcode-wrap').children('.tzn-spinner-eclipse').css({'display': 'inline-block'});
        tzn_search_in_process = true;

        return $.ajax({
            beforeSend: function (xhr) {
            },
            type: 'POST',
            url: tzn_ls.tzn_ajax_url,
            data: data,
            contentType: false,
            processData: false
        });
    }

    function tzn_get_ls_rest_ajax(elem, data) {
        elem.parents('.tzn-ls-shortcode-wrap').children('.tzn-spinner-eclipse').css({'display': 'inline-block'});
        tzn_search_in_process = true;

        return $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-WP-Nonce", tzn_ls.tzn_rest_nonce);
            },
            type: "GET",
            url: tzn_ls.tzn_rest_url,
            data: data
        });
    }
});