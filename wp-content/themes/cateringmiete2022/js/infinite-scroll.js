/**
 * WooCommerce Hybrid Infinite Scroll
 * 
 * Implementiert einen hybriden Infinite-Scroll-Ansatz mit einem "Mehr laden"-Button
 * für WooCommerce-Produktarchive.
 */
(function($) {
    'use strict';
    
    // Status-Variablen
    let isLoading = false;
    let canLoadMore = true;
    let currentPage = parseInt(tznInfiniteScroll.current_page) || 1;
    let maxPages = parseInt(tznInfiniteScroll.max_page) || 1;
    
    // DOM-Elemente
    const $loadMoreButton = $('.tzn-load-more-button');
    const $loadMoreWrapper = $('.tzn-load-more');
    const $productsContainer = $('.products');
    const $scrollTopButton = $('.tzn-scroll-top');
    
    /**
     * Initialisiere den Infinite Scroll
     */
    function init() {
        bindEvents();
        updateButtonState();
    }
    
    /**
     * Event-Handler binden
     */
    function bindEvents() {
        // "Mehr laden"-Button-Handler
        $loadMoreButton.on('click', function() {
            loadMoreProducts();
        });
        
        // Scroll-Handler für "Nach oben"-Button
        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 300) {
                $scrollTopButton.addClass('visible');
            } else {
                $scrollTopButton.removeClass('visible');
            }
        });
        
        // "Nach oben"-Button-Handler
        $scrollTopButton.on('click', function() {
            $('html, body').animate({ scrollTop: 0 }, 500);
        });
    }
    
    /**
     * Button-Status aktualisieren
     */
    function updateButtonState() {
        if (currentPage >= maxPages) {
            $loadMoreWrapper.addClass('finished');
            canLoadMore = false;
        } else {
            $loadMoreWrapper.removeClass('finished');
            canLoadMore = true;
        }
    }
    
    /**
     * Produkte laden
     */
    function loadMoreProducts() {
        if (isLoading || !canLoadMore) {
            return;
        }
        
        isLoading = true;
        $loadMoreButton.addClass('loading').text(tznInfiniteScroll.loading_text);
        
        $.ajax({
            url: tznInfiniteScroll.ajaxurl,
            type: 'POST',
            data: {
                action: 'tzn_load_more_products',
                nonce: tznInfiniteScroll.nonce,
                page: currentPage + 1,
                query_vars: tznInfiniteScroll.query_vars
            },
            success: function(response) {
                isLoading = false;
                
                if (response.success && response.data.html) {
                    // Füge neue Produkte hinzu
                    $productsContainer.append(response.data.html);
                    
                    // Erhöhe die aktuelle Seite
                    currentPage++;
                    
                    // Aktualisiere Button-Status
                    updateButtonState();
                    
                    // Button-Text zurücksetzen
                    $loadMoreButton.removeClass('loading').text(currentPage >= maxPages ? tznInfiniteScroll.finished_text : 'Mehr Produkte laden');
                    
                    // Event auslösen, um andere Scripts zu benachrichtigen
                    $(document).trigger('tzn_products_loaded', [response.data.html]);
                } else {
                    // Fehler behandeln
                    $loadMoreButton.removeClass('loading').text(tznInfiniteScroll.error_text);
                }
            },
            error: function() {
                isLoading = false;
                $loadMoreButton.removeClass('loading').text(tznInfiniteScroll.error_text);
            }
        });
    }
    
    // Initialisieren, wenn das Dokument bereit ist
    $(document).ready(function() {
        init();
    });
    
    // Öffentliche API
    window.tznInfiniteScroll = $.extend({}, window.tznInfiniteScroll || {}, {
        loadMore: loadMoreProducts,
        getCurrentPage: function() { return currentPage; },
        getMaxPages: function() { return maxPages; }
    });
})(jQuery);