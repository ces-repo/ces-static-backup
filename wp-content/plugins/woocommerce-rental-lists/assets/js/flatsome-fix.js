/**
 * Fix für Flatsome Cart Refresh
 */
(function($) {
    'use strict';
    
    // Globales Flatsome-Objekt erstellen, wenn es nicht existiert
    if (typeof window.Flatsome === 'undefined') {
        window.Flatsome = {};
    }
    
    // Cart Refresh sicherstellen
    if (typeof window.Flatsome.checkoutUpdateOnChange === 'undefined') {
        window.Flatsome.checkoutUpdateOnChange = false;
    }
    
    $(document).ready(function() {
        // Ereignis abfangen, wenn Produkt zum Warenkorb hinzugefügt wurde
        $(document.body).on('added_to_cart', function() {
            // Sicheres Update der Minikörbe
            if ($('.cart-item').length) {
                $(document.body).trigger('wc_fragment_refresh');
            }
        });
    });
})(jQuery);