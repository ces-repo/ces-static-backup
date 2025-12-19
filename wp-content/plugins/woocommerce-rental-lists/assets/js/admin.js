/**
 * WooCommerce Rental Lists - Admin JavaScript
 */
(function($) {
    'use strict';

    // DOM ready
    $(function() {
        // Template management
        initTemplateManagement();
    });

    /**
     * Initialize template management functionality
     */
    function initTemplateManagement() {
        const $templateProducts = $('#template_products');
        const $addProductButton = $('.add-product');
        const $removeProductButton = $('.remove-product');
        
        // Add product button
        $addProductButton.on('click', function() {
            const $newProduct = $('.template-product').first().clone();
            
            // Reset values
            $newProduct.find('select').val('').trigger('change');
            $newProduct.find('input[type="number"]').val(1);
            
            // Add to DOM
            $templateProducts.append($newProduct);
            
            // Re-initialize select2
            initProductSearch($newProduct.find('.wc-product-search'));
        });
        
        // Remove product button (delegated)
        $(document).on('click', '.remove-product', function() {
            const $products = $('.template-product');
            
            if ($products.length > 1) {
                $(this).closest('.template-product').remove();
            } else {
                alert(wc_rental_lists_params.i18n.min_one_product);
            }
        });
        
        // Edit template form
        $('#edit-template-form').on('submit', function(e) {
            const $form = $(this);
            const $products = $('.template-product');
            let valid = true;
            
            // Check if all products are selected
            $products.each(function() {
                const $product = $(this).find('select');
                
                if (!$product.val()) {
                    valid = false;
                    $product.addClass('error');
                } else {
                    $product.removeClass('error');
                }
            });
            
            if (!valid) {
                e.preventDefault();
                alert(wc_rental_lists_params.i18n.select_all_products);
                return false;
            }
            
            return true;
        });
        
        // Initialize product search on existing fields
        $('.wc-product-search').each(function() {
            initProductSearch($(this));
        });
    }

    /**
     * Initialize select2 for product search
     * 
     * @param {jQuery} $element - The select element
     */
    function initProductSearch($element) {
        $element.select2({
            ajax: {
                url: ajaxurl,
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    return {
                        term: params.term,
                        action: 'woocommerce_json_search_products_and_variations',
                        security: wc_rental_lists_params.search_products_nonce
                    };
                },
                processResults: function(data) {
                    const terms = [];
                    
                    if (data) {
                        $.each(data, function(id, text) {
                            terms.push({
                                id: id,
                                text: text
                            });
                        });
                    }
                    
                    return {
                        results: terms
                    };
                },
                cache: true
            },
            minimumInputLength: 1
        });
    }

})(jQuery);