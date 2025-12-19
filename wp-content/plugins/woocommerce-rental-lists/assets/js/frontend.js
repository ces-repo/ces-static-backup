/**
 * WooCommerce Rental Lists Frontend JavaScript
 * Robuste Implementierung für Mietlisten-Funktionalität
 */
(function($) {
    'use strict';
	
	 console.log('WooCommerce Rental Lists - Frontend JS geladen');
    console.log('jQuery Version:', $.fn.jquery);
	
	

 // Debugging function to check element existence
    function checkElementExistence() {
        console.log('Checking element existence:');
        console.log('Create List Form:', $('#rental-list-create-form').length);
        console.log('Delete List Buttons:', $('.rental-list-delete').length);
        console.log('Add Product Buttons:', $('.add-product-to-list').length);
    }

	
    // Konfigurationsobjekt
    const CONFIG = {
        selektoren: {
            listErstellen: '#rental-list-create-form',
            listLoeschen: '.rental-list-delete',
            listBearbeiten: '.rental-list-edit',
            produktSuche: '#product_search',
            produktHinzufuegen: '.add-product-to-list',
            produktSuchergebnisse: '#product-search-results',
            mengeAendern: '.rental-list-item-qty',
            artikelEntfernen: '.rental-list-item-remove',
            alleZumWarenkorb: '.add-list-to-cart'
        },
        klassen: {
            laden: 'laden',
            deaktiviert: 'deaktiviert'
        },
        ereignisse: {
            produktSucheVerzoegerung: 500  // ms
        }
    };

/**
 * Einzelnen Artikel zum Warenkorb hinzufügen
 */
function initEinzelArtikelZumWarenkorb() {
    $(document).on('click', '.add-single-to-cart', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const productId = $button.data('product-id');
        const itemId = $button.data('item-id');
        const quantity = $button.closest('tr').find('.rental-list-item-qty').val();
        
        $button.addClass('loading');
        
        ajaxAnfrage(
            'rental_list_add_single_to_cart', 
            { product_id: productId, quantity: quantity },
            (antwort) => {
                $button.removeClass('loading');
                showNotification(antwort.data.message || 'Produkt wurde in den Warenkorb gelegt', 'success');
            },
            () => {
                $button.removeClass('loading');
            }
        );
    });
}
	
// Produktsuche-Modal vorbereiten
function resetProductModal() {
    // Status zurücksetzen
    productSelected = false;
    
    // UI-Elemente zurücksetzen
    $('#product_search').val('').show();
    $('#selected_product_id').val('');
    $('#product-search-results').empty();
    
    // Produktinfo und Mengen-Zeile ausblenden
    $('.selected-product-info').remove(); // Alle vorherigen entfernen
    $('#product-quantity-row').hide();
    $('#reset-product-search').hide();
}
	
// Fehlende Funktionen für Bearbeiten
function initListBearbeiten() {
    $(document).on('click', CONFIG.selektoren.listBearbeiten, function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const listId = $button.data('list-id');
        const listName = $button.closest('.rental-list').find('.rental-list-name').text();
        const listDescription = $button.closest('.rental-list').data('description');
        
        // Modal mit Daten füllen
        $('#edit-list-modal #edit_list_id').val(listId);
        $('#edit-list-modal #edit_list_name').val(listName);
        $('#edit-list-modal #edit_list_description').val(listDescription);
        
        // Modal anzeigen
        $('#edit-list-modal').fadeIn();
    });
	
	 // Speichern-Button im Modal
    $(document).on('submit', '#edit-list-form', function(e) {
        e.preventDefault();
        
        const listId = $('#edit_list_id').val();
        const name = $('#edit_list_name').val().trim();
        const beschreibung = $('#edit_list_description').val().trim();
        
        if (!name) {
            zeigeNachricht(wc_rental_lists.i18n.empty_name || 'Bitte gib einen Namen ein', 'fehler');
            return;
        }
        
        ajaxAnfrage(
            'rental_list_update', 
            { list_id: listId, name, beschreibung },
            () => {
                $('#edit-list-modal').fadeOut();
                location.reload();
            }
        );
    });
    
    // Modal schließen
    $(document).on('click', '#edit-list-modal .modal-close, #edit-list-modal .modal-overlay', function() {
        $('#edit-list-modal').fadeOut();
    });
}


// Fehlende Funktionen für Duplizieren
function initListDuplizieren() {
    $(document).on('click', '.rental-list-duplicate', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const listId = $button.data('list-id');
        
        ajaxAnfrage(
            'rental_list_duplicate', 
            { list_id: listId },
            () => location.reload()
        );
    });
}
	
// Verbesserte Benachrichtigungsfunktion
function showNotification(message, type = 'success') {
    // Bestehende Benachrichtigungen entfernen
    $('.rental-list-notification').remove();
    
    // Neue Benachrichtigung erstellen
    const $notification = $('<div>')
        .addClass(`rental-list-notification ${type}`)
        .html(`
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `)
        .appendTo('body');
    
    // Animation
    $notification.fadeIn().delay(3000).fadeOut(function() {
        $(this).remove();
    });
    
    // Schließen-Button
    $notification.find('.notification-close').on('click', function() {
        $notification.fadeOut(function() {
            $(this).remove();
        });
    });
}
	
    /**
     * Zentralisierte Nachrichtenverwaltung
     * @param {string} nachricht - Anzuzeigende Nachricht
     * @param {string} [typ='erfolg'] - Nachrichtentyp (erfolg/fehler/warnung)
     */
    function zeigeNachricht(nachricht, typ = 'erfolg') {
        const $container = $('#rental-list-messages');
        const $nachricht = $('<div>')
            .addClass(`nachricht nachricht-${typ}`)
            .text(nachricht);

        if ($container.length === 0) {
            $('<div>')
                .attr('id', 'rental-list-messages')
                .prependTo('.woocommerce-rental-lists');
        }

        $('#rental-list-messages')
            .empty()
            .append($nachricht)
            .show()
            .delay(3000)
            .fadeOut();
    }

    /**
     * Zentralisierte AJAX-Anfragefunktion
     * @param {string} aktion - WordPress AJAX-Aktion
     * @param {Object} daten - Zusätzliche Anfragedaten
     * @param {Function} erfolg - Erfolgs-Callback
     * @param {Function} [fehler] - Fehler-Callback
     */
    function ajaxAnfrage(aktion, daten = {}, erfolg, fehler) {
        // Konsole für Debugging
        console.group(`AJAX-Anfrage: ${aktion}`);
        console.log('Daten:', daten);

        $.ajax({
            url: wc_rental_lists.ajax_url,
            method: 'POST',
            dataType: 'json',
            data: {
                action: aktion,
                nonce: wc_rental_lists.nonce,
                ...daten
            },
            beforeSend: function() {
                // Lädt-Zustand für Benutzer-Feedback
                $(`[data-action="${aktion}"]`).addClass(CONFIG.klassen.laden);
            },
            success: function(antwort) {
                console.log('Erfolgsantwort:', antwort);

                if (antwort.success) {
                    zeigeNachricht(
                        antwort.data?.nachricht || 'Vorgang erfolgreich', 
                        'erfolg'
                    );
                    if (erfolg) erfolg(antwort);
                } else {
                    zeigeNachricht(
                        antwort.data?.nachricht || 'Ein Fehler ist aufgetreten', 
                        'fehler'
                    );
                    if (fehler) fehler(antwort);
                }
            },
            error: function(xhr, status, fehlerText) {
                console.error('AJAX-Fehler:', status, fehlerText);
                
                zeigeNachricht(
                    wc_rental_lists.i18n.error || 'Netzwerkfehler', 
                    'fehler'
                );

                if (fehler) fehler(xhr);
            },
            complete: function() {
                // Lädt-Zustand entfernen
                $(`[data-action="${aktion}"]`).removeClass(CONFIG.klassen.laden);
                console.groupEnd();
            }
        });
    }

function initListErstellen() {
    $(CONFIG.selektoren.listErstellen).on('submit', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const listName = $form.find('input[name="list_name"]').val().trim();
        const listDescription = $form.find('textarea[name="list_description"]').val().trim();
        
        console.log('Formularwerte:', {
            name: listName,
            description: listDescription
        });
        
        if (!listName) {
            zeigeNachricht(
                wc_rental_lists.i18n.empty_name || 'Bitte gib einen Listennamen ein', 
                'fehler'
            );
            return;
        }
        
        ajaxAnfrage(
            'rental_list_create', 
            { 
                name: listName,               // Umbenannt für das Backend
                description: listDescription   // Umbenannt für das Backend
            },
            () => location.reload()
        );
    });
}
    /**
     * Liste löschen
     */
    function initListLoeschen() {
        $(document).on('click', CONFIG.selektoren.listLoeschen, function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const listId = $button.data('list-id');
            
            if (!confirm(wc_rental_lists.i18n.confirm_delete)) return;
            
            ajaxAnfrage(
                'rental_list_delete', 
                { list_id: listId },
                () => $button.closest('.rental-list').fadeOut(300, function() {
                    $(this).remove();
                })
            );
        });
    }

    /**
     * Produktsuche mit Debounce
     */
    function initProduktsuche() {
        let suchTimeout;
        
        $(CONFIG.selektoren.produktSuche).on('keyup', function() {
            const query = $(this).val().trim();
            
            clearTimeout(suchTimeout);
            
            if (query.length < 3) {
                $(CONFIG.selektoren.produktSuchergebnisse).empty();
                return;
            }
            
            suchTimeout = setTimeout(() => {
                ajaxAnfrage(
                    'rental_list_search_products', 
                    { query },
                    (antwort) => {
                        const $ergebnisse = $(CONFIG.selektoren.produktSuchergebnisse);
                        
                        if (antwort.data.products?.length) {
                            const html = antwort.data.products.map(produkt => `
                                <li data-product-id="${produkt.id}">
                                    ${produkt.image ? `<img src="${produkt.image}" alt="${produkt.name}">` : ''}
                                    <span class="produkt-name">${produkt.name}</span>
                                    <span class="produkt-preis">${produkt.price}</span>
                                </li>
                            `).join('');
                            
                            $ergebnisse.html(`<ul>${html}</ul>`);
                        } else {
                            $ergebnisse.html('<div class="keine-ergebnisse">Keine Produkte gefunden</div>');
                        }
                    }
                );
            }, CONFIG.ereignisse.produktSucheVerzoegerung);
        });
    }

    /**
     * Artikel zur Liste hinzufügen
     */
    // In Ihrer Frontend-JS-Datei
function initArtikelHinzufuegen() {
    $(document).on('click', '.add-product-to-list', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const listId = $button.data('list-id');
        
        console.log('Modal Debug Informationen:');
        console.log('Button geklickt', $button);
        console.log('Listen-ID:', listId);
        
        // Alle Modal-Elemente finden
        const modalSelectors = [
            '#add-product-to-list-modal',
            '.modal#add-product-modal',
            '.add-product-modal'
        ];
        
        let $modal = null;
        for (let selector of modalSelectors) {
            $modal = $(selector);
            if ($modal.length > 0) {
                console.log('Modal gefunden mit Selektor:', selector);
                break;
            }
        }
        
        // Wenn kein Modal gefunden
if (!$modal || $modal.length === 0) {
    console.error('FEHLER: Kein Modal gefunden!');
    showNotification('Modal nicht konfiguriert. Bitte kontaktieren Sie den Support.', 'error');
    return;
}
        
        // Modal Felder vorbelegen
        $modal.find('#product_search').val('');
        $modal.find('#selected_product_id').val('');
        $modal.find('#product_quantity').val(1);
        $modal.find('#product-quantity-row').hide();
        $modal.find('#add-product-list-id').val(listId);
        
        // Modal anzeigen
        try {
            $modal.fadeIn();
            console.log('Modal sollte jetzt sichtbar sein');
        } catch (error) {
            console.error('Fehler beim Modal-Öffnen:', error);
        }
    });
}

    /**
     * Artikelmenge ändern
     */
    function initMengeAendern() {
        $(document).on('change', CONFIG.selektoren.mengeAendern, function() {
            const $input = $(this);
            const itemId = $input.data('item-id');
            let menge = parseInt($input.val(), 10);
            
            // Sicherstellen, dass Menge mindestens 1 ist
            menge = Math.max(1, menge);
            $input.val(menge);
            
            ajaxAnfrage(
                'rental_list_update_item', 
                { item_id: itemId, quantity: menge }
            );
        });
    }

    /**
     * Artikel von Liste entfernen
     */
    function initArtikelEntfernen() {
        $(document).on('click', CONFIG.selektoren.artikelEntfernen, function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $button = $(this);
            const itemId = $button.data('item-id');
            
            ajaxAnfrage(
                'rental_list_remove_item', 
                { item_id: itemId },
                () => $button.closest('.rental-list-item').fadeOut(300, function() {
                    $(this).remove();
                })
            );
        });
    }

    /**
     * Alle Artikel zum Warenkorb hinzufügen
     */
    function initAlleZumWarenkorb() {
        $(document).on('click', CONFIG.selektoren.alleZumWarenkorb, function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const listId = $button.data('list-id');
            
            ajaxAnfrage(
                'rental_list_add_to_cart', 
                { list_id: listId },
                (antwort) => {
                    if (antwort.data.cart_url) {
                        window.location.href = antwort.data.cart_url;
                    }
                }
            );
        });
    }
// Globale Variable für den ausgewählten Produktstatus
let selectedProduct = null;

// Initialisierung des Modals
function initModalHandling() {
    // Modal schließen
    $(document).on('click', '.modal-close, .modal-overlay', function() {
        $('#add-product-to-list-modal').fadeOut();
        resetProductSelection();
    });

    // Funktion zum Zurücksetzen der Produktauswahl
    function resetProductSelection() {
        selectedProduct = null;
        $('#product_search').val('').show();
        $('#selected_product_id').val('');
        $('#product-search-results').empty().hide();
        $('.selected-product-info').remove();
        $('#product-quantity-row').hide();
        
        if ($('#reset-product-search').length) {
            $('#reset-product-search').hide();
        }
    }

    // Produktsuche mit Anzeige der Ergebnisse
    $('#product_search').on('keyup', function() {
        const query = $(this).val().trim();
        
        if (query.length < 3) {
            $('#product-search-results').empty().hide();
            return;
        }

        // AJAX-Anfrage für die Suche
        $.ajax({
            url: wc_rental_lists.ajax_url,
            method: 'POST',
            data: {
                action: 'rental_list_search_products',
                query: query,
                nonce: wc_rental_lists.nonce
            },
            beforeSend: function() {
                $('#product-search-results').html('<div class="loading">Suche...</div>').show();
            },
            success: function(response) {
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let html = '<ul>';
                    
                    response.data.products.forEach(function(product) {
                        html += `
                            <li data-product-id="${product.id}" data-product-name="${product.name}">
                                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : ''}
                                <span class="product-name">${product.name}</span>
                                <span class="product-price">${product.price}</span>
                            </li>
                        `;
                    });
                    
                    html += '</ul>';
                    $('#product-search-results').html(html).show();
                } else {
                    $('#product-search-results').html('<div class="no-results">Keine Produkte gefunden</div>').show();
                }
            },
            error: function() {
                $('#product-search-results').html('<div class="error">Fehler bei der Suche</div>').show();
            }
        });
    });

    // Produkt auswählen
    $(document).on('click', '#product-search-results li', function() {
        const productId = $(this).data('product-id');
        const productName = $(this).data('product-name') || $(this).find('.product-name').text();
        const productImg = $(this).find('img').attr('src') || '';
        
        console.log('Produkt ausgewählt:', productId, productName);
        
        // Produkt speichern
        selectedProduct = {
            id: productId,
            name: productName,
            image: productImg
        };
        
        // Formularfeld aktualisieren
        $('#selected_product_id').val(productId);
        
        // Suchergebnisse ausblenden
        $('#product-search-results').hide();
        
        // Suchfeld ausblenden
        $('#product_search').hide();
        
        // Ausgewähltes Produkt anzeigen
        if ($('.selected-product-info').length === 0) {
            $('<div class="selected-product-info"></div>').insertAfter('#product_search');
        }
        
        $('.selected-product-info').html(`
            ${productImg ? `<img src="${productImg}" alt="${productName}">` : ''}
            <span class="product-name">${productName}</span>
        `).show();
        
        // Reset-Button hinzufügen/anzeigen
        if ($('#reset-product-search').length === 0) {
            $('<button type="button" id="reset-product-search">Zurück zur Suche</button>').insertAfter('.selected-product-info');
        } else {
            $('#reset-product-search').show();
        }
        
        // Mengenauswahl anzeigen
        $('#product-quantity-row').show();
    });

    // Reset-Button
    $(document).on('click', '#reset-product-search', function() {
        resetProductSelection();
    });

    // Beim Öffnen des Modals zurücksetzen
    $(document).on('click', '.add-product-to-list', function() {
        const listId = $(this).data('list-id');
        $('#add-product-list-id').val(listId);
        
        resetProductSelection();
        $('#add-product-to-list-modal').fadeIn();
    });

    // Formular absenden
    $('#add-product-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!selectedProduct || !$('#selected_product_id').val()) {
            showNotification('Bitte wählen Sie ein Produkt aus.', 'error');
            return;
        }
        
        const listId = $('#add-product-list-id').val();
        const productId = $('#selected_product_id').val();
        const quantity = $('#product_quantity').val();
        
        // AJAX für das Hinzufügen des Produkts
        $.ajax({
            url: wc_rental_lists.ajax_url,
            method: 'POST',
            data: {
                action: 'rental_list_add_item',
                list_id: listId,
                product_id: productId,
                quantity: quantity,
                nonce: wc_rental_lists.nonce
            },
            beforeSend: function() {
                $('#add-product-button').prop('disabled', true).addClass('loading');
            },
            success: function(response) {
                if (response.success) {
                    showNotification('Produkt wurde zur Liste hinzugefügt', 'success');
                    $('#add-product-to-list-modal').fadeOut();
                    setTimeout(function() {
                        location.reload();
                    }, 500);
                } else {
                    showNotification(response.data?.message || 'Fehler beim Hinzufügen', 'error');
                    $('#add-product-button').prop('disabled', false).removeClass('loading');
                }
            },
            error: function() {
                showNotification('Ein Fehler ist aufgetreten', 'error');
                $('#add-product-button').prop('disabled', false).removeClass('loading');
            }
        });
    });
}
    /**
     * Initialisierung aller Funktionen
     */
    function init() {
        console.log('WooCommerce Mietlisten initialisiert');
        
        initListErstellen();
        initListLoeschen();
		initListBearbeiten(); // Neu hinzugefügt
    	initListDuplizieren();
        initProduktsuche();
        initArtikelHinzufuegen();
        initMengeAendern();
        initArtikelEntfernen();
        initAlleZumWarenkorb();
		initModalHandling(); // Fügen Sie diese Zeile hinzu
		initEinzelArtikelZumWarenkorb(); 
    }



// Verbesserter Error Handling
window.addEventListener('error', function(event) {
    console.error('Unerwarteter Fehler:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Zusätzliche Konsolen-Logging
console.log('WooCommerce Rental Lists Frontend-Skript geladen');
console.log('jQuery Version:', jQuery.fn.jquery);
console.log('Konfiguration:', wc_rental_lists);
	
	
// Beim Laden des Dokuments initialisieren
$(document).ready(init);

// Ensure DOM is fully loaded
$(document).ready(function() {
    console.log('Document Ready - Rental Lists');
});

})(jQuery);