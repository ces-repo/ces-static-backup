
jQuery(document).ready(function ($) {
    jQuery( "body" ).on( "change input", ".quantity .qty", function() {
		var add_to_cart_button = jQuery( this ).parents( ".product" ).find( ".add_to_cart_button" );
		add_to_cart_button.attr( "data-quantity", jQuery( this ).val() );
		add_to_cart_button.attr( "href", "?add-to-cart=" + add_to_cart_button.attr( "data-product_id" ) + "&quantity=" + jQuery( this ).val() );
	});
    jQuery( "body" ).on( "change", "#variation_change", function() {
        var price = $(this).find(':selected').data('price');
        jQuery( this ).parents( ".product" ).find( ".price-wrapper .price" ).html(price);
		var add_to_cart_button = jQuery( this ).parents( ".product" ).find( ".add_to_cart_button" );
		add_to_cart_button.attr( "data-product_id", jQuery( this ).val() );
		add_to_cart_button.attr( "href", "?add-to-cart=" + jQuery( this ).val() + "&quantity=" + add_to_cart_button.attr( "data-quantity" ) );
	});
});
jQuery(document).ready(function ($) {
	
    var $loading = $('#loading_loadmore').hide();
    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
    });
    function update_date_time_for_shipping_fields(){
        if( $('#additional_abholdatum').length )
        {
            $( "#additional_abholdatum" ).datepicker({ dateFormat: 'dd-mm-yy' });
        }
        if( $('#additional_ruckgabedatum').length )
        {
            $( "#additional_ruckgabedatum" ).datepicker({ dateFormat: 'dd-mm-yy' });
        }
        if( $('#additional_date_from_liefer').length )
        {
            $( "#additional_date_from_liefer" ).datepicker({ dateFormat: 'dd-mm-yy' }).datepicker("setDate",'now');
        }
        if( $('#additional_date_to_liefer').length )
        {
            $( "#additional_date_to_liefer" ).datepicker({ dateFormat: 'dd-mm-yy' }).datepicker("setDate",'now');
        }
        if( $('#additional_time_from_liefer').length )
        {
            show_hide_time(2);
        }
    }
    jQuery( document ).on( 'updated_checkout', function() { 
        update_state_stateu_shipping_method();
    });

    function update_state_stateu_shipping_method(){
        var state = "";
        if($("#ship-to-different-address-checkbox").is(":checked")){
            state = $("#shipping_city").val();
        }
        else{
            state = $("#billing_city").val();
        }
        if(state != ""){
            $("#state_billing_customer").text(state);
        }
    }

    // $("body").on("click", "#ship-to-different-address >label", function(){
    //     console.log("click");
    //     if($("#ship-to-different-address-checkbox").is(":checked")) {
    //         $.cookie("different_address_checkbox", 1, { expires : 10 });
    //         console.log("checked");
    //     }
    //     else{
    //         $.removeCookie("different_address_checkbox");
    //         console.log("uncheck");
    //     }
    // });

    
    $('body').on('click', 'button.dropdown-toggle', function() {
        $(this).next().toggle();
    });
	$('body').on('click', '.mfp-content .has-dropdown .icon-angle-down', function() {
        $(this).toggleClass('active');
    });
    $('body').on('change paste keyup', '#billing_address_1, #shipping_address_1', function() {
        $( document.body ).trigger( 'update_checkout' );
    });
    $('body').on('change paste keyup', '#billing_firma_field input', function() {
        $("body.woocommerce-checkout #billing_company_field input").val($(this).val());
    });
});