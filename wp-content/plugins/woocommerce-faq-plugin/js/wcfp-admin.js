
jQuery(document).ready(function($) {
    var searchTimeout;
    var productIds = $('#wcfp_product_ids').val().split(',').filter(Boolean);
    
    // Produktsuche
    $('#wcfp_product_search').on('keyup', function() {
        var searchTerm = $(this).val();
        
        clearTimeout(searchTimeout);
        
        if (searchTerm.length < 3) {
            $('#wcfp_product_results').hide();
            return;
        }
        
        searchTimeout = setTimeout(function() {
            $.ajax({
                url: wcfp_admin.ajax_url,
                data: {
                    action: 'wcfp_search_products',
                    term: searchTerm,
                    nonce: wcfp_admin.nonce
                },
                success: function(response) {
                    var resultsHtml = '';
                    
                    if (response.length > 0) {
                        for (var i = 0; i < response.length; i++) {
                            if (productIds.indexOf(response[i].id.toString()) === -1) {
                                resultsHtml += '<div data-id="' + response[i].id + '">' + response[i].text + '</div>';
                            }
                        }
                        
                        if (resultsHtml) {
                            $('#wcfp_product_results').html(resultsHtml).show();
                        } else {
                            $('#wcfp_product_results').html('<div>Alle passenden Produkte bereits ausgewählt</div>').show();
                        }
                    } else {
                        $('#wcfp_product_results').html('<div>Keine Produkte gefunden</div>').show();
                    }
                }
            });
        }, 500);
    });
    
    // Produkt auswählen
    $(document).on('click', '#wcfp_product_results div', function() {
        var productId = $(this).data('id');
        var productText = $(this).text();
        
        if (!productId || productIds.indexOf(productId.toString()) !== -1) {
            return;
        }
        
        productIds.push(productId.toString());
        $('#wcfp_product_ids').val(productIds.join(','));
        
        $('#wcfp_selected_products').append(
            '<li data-id="' + productId + '">' +
            productText +
            '<a href="#" class="wcfp-remove-product">×</a>' +
            '</li>'
        );
        
        $('#wcfp_product_search').val('');
        $('#wcfp_product_results').hide();
    });
    
    // Produkt entfernen
    $(document).on('click', '.wcfp-remove-product', function(e) {
        e.preventDefault();
        
        var productId = $(this).parent().data('id').toString();
        var index = productIds.indexOf(productId);
        
        if (index !== -1) {
            productIds.splice(index, 1);
            $('#wcfp_product_ids').val(productIds.join(','));
            $(this).parent().remove();
        }
    });
});
