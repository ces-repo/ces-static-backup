jQuery(document).ready(function ($) {
    const tab_icons = tzn_admin_js.tab_icons;
    let doingAjax = false;

    //checkbox
    $('.type-checkbox input').on('change', function () {
        ($(this).is(':checked') ? $(this).val(1) : $(this).val(0))
    });
    //color
    $('.color-picker').wpColorPicker({
        change: function (event, ui) {
            $(this).attr('value', ui.color.toString())
        },
    });
    //accordion in admin sections
    $(".grid-item section").accordion({
        collapsible: true,
        header: 'h2',
        heightStyle: 'content',
    });

    let custom_uploader;

    //upload img icon
    $(document).on('click', '.upload-img', function (e) {
        e.preventDefault();
        let elem = $(this);
        let field_row = elem.parents('.tzn-field');
        let input = $('input[type="hidden"]', field_row);

        custom_uploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Image',
            library: {
                type: 'image'
            },
            button: {
                text: 'Choose Image'
            },
            multiple: false
        }).on('select', function () {
            const attachment = custom_uploader.state().get('selection').first().toJSON();
            //console.log(input);
            const img = '<img width="32" height="32" src="' + attachment.url + '" class="attachment-32x32 size-32x32" alt="" loading="lazy">';
            input.val(attachment.id);
            $(img).insertAfter(input);

        }).open();//Open the uploader dialog

    });

    $('.delete-img').click(function (e) {
        e.preventDefault();
        const field_row = $(this).closest('.tzn-field');
        field_row.find('input[type="hidden"]').val('');
        field_row.find('img').remove();
    });

    //submit function
    $('.submit #submit').click(function () {
        $('.shipping-provider').each(function (index, el) {
            if ($(this).find('.shipping-logo').val() == '') {
                $(this).remove();
            }
        });
    });
    //Shipping repeater
    //wp login logo
    $(".shipping-providers-wrapper fieldset").sortable();
    $('.shipping-providers-wrapper').on('click', '.shipping_upload_logo', function (e) {
        e.preventDefault();
        self = $(this);
        //If the uploader object has already been created, reopen the dialog
        if (custom_uploader) {
            custom_uploader.open();
            return;
        }
        //Extend the wp.media object
        custom_uploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Image',
            button: {
                text: 'Choose Image'
            },
            multiple: false
        });
        //When a file is selected, grab the URL and set it as the text field's value
        custom_uploader.on('select', function () {
            attachment = custom_uploader.state().get('selection').first().toJSON();
            img = '<img width="32" height="32" src="' + attachment.url + '" class="attachment-32x32 size-32x32" alt="" loading="lazy">';
            console.log(attachment);
            console.log(self);
            self.closest('.shipping_provider').find('.shipping_name').after(img);
            self.closest('.shipping_provider').find('.shipping_name').val(attachment.title);
            self.closest('.shipping_provider').find('.shipping_logo').val(attachment.id);
        });
        //Open the uploader dialog
        custom_uploader.open();
    });
    $('.shipping-providers-wrapper').on('click', '.shipping_delete_logo', function (e) {
        e.preventDefault();
        var index = $(this).closest('.shipping_provider').index();
        $('.shipping-providers-wrapper .shipping_provider').eq(index).remove();
        $('.shipping_provider').each(function (index, el) {
            $(this).find($('.shipping_name')).attr('name', 'shipping_provider[' + index + '][name]');
            $(this).find($('.shipping_logo')).attr('name', 'shipping_provider[' + index + '][image]');
        });
    });

    function shipping_repeater(index) {
        return '<div class="tzn-field type-image shipping_provider">' + '<input class="shipping_logo" type="hidden" name="tzn-options[' + tab_icons + '][shipping_provider][' + index + '][image]" value="" />' + '<div class="buttons-wrapper" style="display: inline;">' + '<button class="button upload-img">Select</button>' + '<button class="button btn-danger delete-img"><i class="far fa-times"></i></button>' + '</div>' + '</div>';
    }

    $('.btn-add-more').click(function (e) {
        e.preventDefault();
        var index = $('.shipping-providers-wrapper fieldset .shipping_provider').length;
        $('.shipping-providers-wrapper fieldset').append(shipping_repeater(index));
    });


    /**
     * *********************************************************************
     * *************************** LOYALTY -- START ************************
     * *********************************************************************
     */
    $(document).on('click', '.tzn-add-gift-product', function (e) {
        e.preventDefault();
        const el = $(this);
        let nth = parseInt(el.attr('data-product-nth'), 10);
        if (isNaN(nth) || nth === 'undefined') {
            return;
        }

        el.attr('data-product-nth', nth + 1);
        const parent = el.parents('.tzn-gifts-wrapper');
        const tpl = $('.tzn-gift-product-tpl', parent).clone();
        $('.tzn-gift-product-input', tpl).removeAttr('disabled');

        let gift_product_html = tpl.html();
        gift_product_html = gift_product_html.replace(/NTH_PRODUCT_INDEX/g, nth);
        $(gift_product_html).insertBefore(el);
    });

    $(document).on('click', '.delete-gift-product', function (e) {
        e.preventDefault();
        $(this).parents('.tzn-gift-product').remove();
    });

    $(document).on('click', '.delete-gift-wrapper:not(.delete-gift-wrapper-0)', function (e) {
        e.preventDefault();
        $(this).parents('.tzn-gifts-wrapper').remove();
    });

    $(document).on('click', '.tzn-add-gift', function (e) {
        e.preventDefault();
        const el = $(this);
        const parent = el.parents('.tzn-add-gift-wrapper');
        let nth = parseInt(el.attr('data-gift-nth'), 10);

        if (isNaN(nth) || nth === 'undefined') {
            return;
        }

        const gift_wrapper = el.parents('.input-wrapper').children('.tzn-gifts-wrapper-clone').clone();
        let gift_wrapper_html = gift_wrapper.html();
        gift_wrapper_html = gift_wrapper_html.replace(/NTH_INDEX/g, nth);

        el.attr('data-gift-nth', nth + 1);
        $(gift_wrapper_html).insertBefore(parent);
    });

    $(document).on('submit', '#tzn-admin-form', function (e) {
        $('.tzn-gifts-wrapper-clone').remove();
        $('.tzn-gift-product-tpl').remove();
        $('.tzn-gift-currency option').removeAttr('disabled');
    });

    /**
     * *********************************************************************
     * ************************** LOYALTY -- END ***************************
     * *********************************************************************
     */

    /**
     * *********************************************************************
     * ********************* PRODUCTS SYNC -- START ************************
     * *********************************************************************
     */


    $(document).on('click', '.tzn-sync-products', function (e) {
        e.preventDefault();
        const el = $(this);
        el.attr('disabled', 'disabled');
        el.addClass('tzn-loading');
        $('.tzn-sync-container').addClass('tzn-show-progress');

        tznSyncronizeProducts(el);
    });

    function tznSyncronizeProducts(el, data = null) {

        const total = parseInt(el.attr('data-total'), 10);

        if (isNaN(total) || total === 'undefined' || !total) {
            console.log('Products total is invalid');
            return;
        }

        doingAjax = true;

        if (data === null) {
            data = new FormData();
            data.append('action', 'tzn_synchronize_products');
            data.append('p_id', 0);
            data.append('total', total);
        }


        const ajax = tzn_admin_ajax(data);

        ajax.done(function (response) {
            console.log(response);
            if (typeof response === 'object') {

                if (!response.success) {
                    console.log(response.message);
                    return;
                }

                if (response.progress < 100) {
                    data.set('p_id', response.p_id);

                    tznSyncronizeProducts(el, data);
                }


                if (response.progress <= 3) {
                    $('.tzn-sync-progress').text(3 + '%');
                } else {
                    $('.tzn-sync-progress').text(response.progress + '%').css({'width': response.progress + '%'});
                    if (response.progress === 100) {
                        //$('.lstc-import-progress').css({'color': '#10b493'});
                        $('.tzn-sync-progress').text(response.progress + '% Done');
                        doingAjax = false;

                        setTimeout(function () {
                            $('.tzn-sync-container').removeClass('tzn-show-progress');
                            el.removeAttr('disabled').removeClass('tzn-loading');
                            $('.tzn-sync-progress').text('3%').css({'width': '3%'});
                        }, 1000);
                    }
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        });
    }

    window.addEventListener('beforeunload', function (e) {
        if (doingAjax) {
            e.preventDefault();
            e.returnValue = '';
            return tzn_admin_js.msg_bg_task;
        }
    });

    function tzn_admin_ajax(data) {
        return $.ajax({
            type: "POST",
            url: tzn_admin_js.tzn_ajax_url,
            data: data,
            contentType: false,
            processData: false
        });
    }

    /**
     * *********************************************************************
     * ********************* PRODUCTS SYNC -- END **************************
     * *********************************************************************
     */
});