//import { prevent_hash_scroll } from "./tzn-digital.js";
//'use strict';
jQuery(document).ready(function ($) {
    /* Create object */
    class tznCheckout {
        step = {
            id: 'your-information',
            name: 'Your Information',
            prev_step: '',
        }
        fields = {
            shipping: [],
            billing: [],
        };
        nonce = this.getNonceValue();
        constructor() {
            this.initCometics();
            this.addFields();
            this.labelClickFix();
            this.shippingDHL();
            this.updatedCheckout();
        }
        
        validateEmail(email) {
            var re = /\S+@\S+\.\S+/;
            return re.test(email);
        }
        validateFieldFail(input) {
            input.closest('.validate-required').addClass('field-not-validated')
        }
        validateFieldPass(input) {
            input.closest('.validate-required').removeClass('field-not-validated')
            input.closest('.validate-required').addClass('field-validated');
        }
        validateFields() {
            const tznSelf = this;
            var validated = [];
            var checked = [];
            $('.validate-required .input-text:visible').each(function () {
                var id = $(this).attr('id');
                if ($(this).val().length < 1) {
                    tznSelf.validateFieldFail($(this));
                    validated.push(false);
                } else {
                    tznSelf.validateFieldPass($(this));
                    validated.push(true);
                }
                if ($(this).attr('type') === 'email') {
                    if (tznSelf.validateEmail($(this).val())) {
                        tznSelf.validateFieldPass($(this));
                        validated.push(true);
                    } else {
                        tznSelf.validateFieldFail($(this));
                        validated.push(false);
                    }
                }
                checked.push($(this));
            });
            var checked_names = [];

            if (validated.includes(false)) {
                return false;
            } else {
                return true;
            }
        }
        addFields() {
            const tznSelf = this;
            let billingToShipping = $('#ship-to-different-address-checkbox').is(':checked');
            if (!billingToShipping) {
                $('.woocommerce-billing-fields__field-wrapper input, .woocommerce-billing-fields__field-wrapper select option:selected').each(function () {
                    var input_val = $(this).val();
                    //select
                    if ($(this).parent('select').length) {
                        // var input_val = $(this).val();
                        var field_name = $(this).closest('select').attr('name');
                    } else if ($(this).is(':radio') && $(this).is(':checked')) {
                        // var input_val = $(this).next('label').text();
                        var field_name = $(this).attr('name');
                        var clean_name = field_name.split(/_(.+)/)[1];
                        $('#shipping_' + clean_name + '_' + input_val).prop("checked", true);

                    } else {
                        var field_name = $(this).attr('name');
                    }
                    var clean_name = field_name.split(/_(.+)/)[1];
                    clean_name = clean_name.replace(/\[\]/, '');
                    let shipping_field = $('#shipping_' + clean_name);
                    if ((typeof shipping_field !== 'undefined') && (typeof shipping_field.val() !== 'undefined') && !shipping_field.val().length) {
                        shipping_field.val(input_val);
                    }
                });
            }
            $('.woocommerce-billing-fields__field-wrapper input, .woocommerce-billing-fields__field-wrapper select option:selected, .woocommerce-shipping-fields__field-wrapper input, .woocommerce-shipping-fields__field-wrapper select option:selected').each(function () {
                if ($(this).is(':radio') && !$(this).is(':checked')) {
                    return;
                }

                var input_val = $(this).val();
                //select
                if ($(this).parent('select').length) {
                    var input_val = $(this).text();
                    var field_name = $(this).closest('select').attr('name');
                } else if ($(this).is(':radio') && $(this).is(':checked')) {
                    var input_val = $(this).next('label').text();
                    var field_name = $(this).attr('name');

                } else {
                    var field_name = $(this).attr('name');
                }
                var clean_name = field_name.split(/_(.+)/)[1];
                var type = field_name.split(/_(.+)/)[0];
                //check if exists, then update
                let this_field = tznSelf.getField(field_name, type);
                let field = {
                    id: field_name,
                    value: input_val,
                    clean_name: clean_name
                }
                if (typeof this_field === 'undefined') {
                    if (typeof tznSelf.fields[type] === 'undefined') {
                        tznSelf.fields[type] = [];
                    }
                    tznSelf.fields[type].push(field);
                } else {
                    this_field.value = input_val;
                }
            });

        }
        getField(id, type) {
            let res;
            //var type = id.split(/_(.+)/)[0];

            if (!Array.isArray(this.fields[type])) {
                this.fields[type] = [];
            }

            if (typeof this.fields[type] !== 'undefined' && this.fields[type].length) {
                for (var i = this.fields[type].length - 1; i >= 0; i--) {
                    var field = this.fields[type][i];
                    if (field.id == id) {
                        res = field;
                        break;
                    }
                }
            }
            return res;
        }
        populateFields() {
            this.addFields();
            //billing
            for (var i = this.fields.billing.length - 1; i >= 0; i--) {
                let id = this.fields.billing[i].id,
                    value = this.fields.billing[i].value,
                    clean_name = this.fields.billing[i].clean_name;
                $('.addresses .billing-address .billing_' + clean_name + '').text(value);
            }
            for (var i = this.fields.shipping.length - 1; i >= 0; i--) {
                let id = this.fields.shipping[i].id,
                    value = this.fields.shipping[i].value,
                    clean_name = this.fields.shipping[i].clean_name;
                $('.addresses .shipping-address .shipping_' + clean_name).text(value);
            }

        }
        initCometics() {
            this.stickyAddToCart();
        }
        stickyAddToCart() {
            if ($(document).innerWidth() > 850) {
                var lastScrollTop = 0;
                $(document).scroll(function () {

                    var currentScrollTop = $(this).scrollTop(),
                        button = $('#review-order #place_order').offset().top,
                        sticky_footer = $('.sticky-submit-order'),
                        footer = $('#cart-checkout-footer'),
                        footer_height = footer.outerHeight();
                    // console.log(currentScrollTop, button);
                    if (currentScrollTop > button && !footer.isOnScreen()) {
                        sticky_footer.addClass('sticky');
                        sticky_footer.css('bottom', 0);
                        //correct position when footer appears                        
                    } else if (currentScrollTop > button && footer.isOnScreen()) {
                        sticky_footer.css('bottom', footer_height + 'px');
                    } else {
                        sticky_footer.removeClass('sticky');
                        sticky_footer.css('bottom', '-350px');
                    }
                    lastScrollTop = currentScrollTop;

                });
            }
            //checkboxes
            $(document).on('change', '.order-checkbox-submit .woocommerce-form__label-for-checkbox input[type="checkbox"]', function () {
                var type = $(this).closest('.wc-gzd-checkbox-placeholder').data('checkbox');
                $('.sticky-submit-order .wc-gzd-checkbox-placeholder[data-checkbox="' + type + '"] input').prop('checked', this.checked);

            });
            $('.sticky-submit-order .woocommerce-form__label-for-checkbox input[type="checkbox"]').on('change', function () {
                var type = $(this).closest('.wc-gzd-checkbox-placeholder').data('checkbox');
                $('.order-checkbox-submit .wc-gzd-checkbox-placeholder[data-checkbox="' + type + '"] input').prop('checked', this.checked);
            });
            //prevent scroll on label click
            $('.sticky-submit-order .woocommerce-form__label-for-checkbox').each(function (i, el) {
                var label = $(this),
                    input = $(this).find('input');
                label.attr('for', 'sticky-checkbox-' + i);
                input.attr('id', 'sticky-checkbox-' + i);
            })
            //btn click
            $('.btn-submit-order').click(function () {
                $('#place_order').click();
            });
        }
        shippingDHL() {
            //dhl plugin for packetstation button - show/hide
            $('#shipping_dhl_postnum_field').addClass('validate-required');
            $('#shipping_dhl_address_type_field select').on('change', function () {
                if (this.value.includes('dhl')) {
                    $('#dhl_parcel_finder').show();
                } else {
                    $('#dhl_parcel_finder').hide();
                }
            });
        }
        labelClickFix() {
            //germanized legal labels before/after submit order
            $(document).on('click', '.woocommerce-form__label-for-checkbox label', function (e) {
                var checkbox = $(this).find(':checkbox');
                checkbox.prop('checked', !checkbox.is(':checked'));
            });
        }
        getNonceValue() {
            return $('#woocommerce-process-checkout-nonce').val();
        }
        updatedCheckout() {
            const tznSelf = this;
            //?wc-ajax=checkout
            $(document).on('updated_checkout', function () {
                //fix for not be able to make an order as guest and using a coupon. Issue caused by Woo Discount Rules - removes nonce field, doesn't matter which coupon is used.
                var updated_nonce = $('#woocommerce-process-checkout-nonce').val();
                if (!updated_nonce) {
                    $('<input type="hidden" id="woocommerce-process-checkout-nonce" name="woocommerce-process-checkout-nonce" class="custom" value="' + tznSelf.nonce + '">').insertAfter('#place_order');
                }
            });
        }
    }
    const TZNCheckout = new tznCheckout();
    window.tznCheckout = TZNCheckout;

    //stripe button
    $(window).on('load', function () {
        $('#your-information #wc-stripe-payment-request-button').insertAfter('#payment .wc-gzd-order-submit')
        $('#shipping_dhl_address_type_field').prependTo('.shipping_address');
        //dhl plugin for packetstation button - show/hide
        $('#dhl_parcel_finder').hide();
    });

    $(document).on('keyup', '.order-review #wc_checkout_add_ons input', function () {
        var text_val = $(this).val(),
            field_id = $(this).attr('id');
        $('#your-information #wc_checkout_add_ons input#' + field_id).val(text_val);
    });
    $.fn.isOnScreen = function () {
        let isOnScreen = false;

        var win = $(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        if (bounds) {
            bounds.right = bounds.left + this.outerWidth();
            bounds.bottom = bounds.top + this.outerHeight();
            isOnScreen = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
        }

        return isOnScreen;

    };
});
