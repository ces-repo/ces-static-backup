/**
 * Admin JavaScript für WooCommerce Instagram Autoposter
 */
jQuery(document).ready(function($) {
    
    // Tabs für Einstellungsseite
    $('.wc-instagram-tab-nav a').on('click', function(e) {
        e.preventDefault();
        
        var targetId = $(this).attr('href').replace('#', '');
        
        // Aktiven Tab markieren
        $('.wc-instagram-tab-nav li').removeClass('active');
        $(this).parent().addClass('active');
        
        // Tab-Inhalt anzeigen
        $('.wc-instagram-tab-content').removeClass('active');
        $('#' + targetId).addClass('active');
        
        // Speichern in Session Storage
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem('wc_instagram_active_tab', targetId);
        }
    });
    
    // Gespeicherten Tab wiederherstellen
    if (typeof(Storage) !== "undefined") {
        var activeTab = sessionStorage.getItem('wc_instagram_active_tab');
        if (activeTab) {
            $('.wc-instagram-tab-nav a[href="#' + activeTab + '"]').trigger('click');
        } else {
            // Standardmäßig ersten Tab anzeigen
            $('.wc-instagram-tab-nav li:first-child a').trigger('click');
        }
    } else {
        // Standardmäßig ersten Tab anzeigen, wenn Session Storage nicht verfügbar ist
        $('.wc-instagram-tab-nav li:first-child a').trigger('click');
    }
    
    // Tooltips
    $('.wc-instagram-tooltip').hover(
        function() {
            $(this).find('.wc-instagram-tooltip-text').css('visibility', 'visible').css('opacity', '1');
        },
        function() {
            $(this).find('.wc-instagram-tooltip-text').css('visibility', 'hidden').css('opacity', '0');
        }
    );
    
    // Ajax-Loader für Buttons mit langer Verarbeitungszeit
    $('.long-running-action').on('click', function() {
        var button = $(this);
        var original_text = button.text();
        
        // Button deaktivieren und Ladeindikator hinzufügen
        button.prop('disabled', true).text(original_text + '...').addClass('button-busy');
        
        // Timeout für die Wiederherstellung, falls die Ajax-Anfrage fehlschlägt
        setTimeout(function() {
            if (button.hasClass('button-busy')) {
                button.prop('disabled', false).text(original_text).removeClass('button-busy');
                alert('Die Anfrage dauert länger als erwartet. Bitte überprüfe die Ergebnisse in einigen Augenblicken oder versuche es erneut.');
            }
        }, 30000); // 30 Sekunden Timeout
    });
    
    // Bestätigungsdialoge für kritische Aktionen
    $('.confirm-action').on('click', function(e) {
        var confirmMessage = $(this).data('confirm') || 'Bist du sicher?';
        
        if (!confirm(confirmMessage)) {
            e.preventDefault();
            return false;
        }
        
        return true;
    });
    
    // Dropdown für Produktkategorie-Filter
    $('.product-category-filter').on('change', function() {
        var url = new URL(window.location.href);
        url.searchParams.set('category', $(this).val());
        window.location.href = url.toString();
    });
    
    // Bildvorschau bei Hover über Thumbnails
    $('.thumbnail-preview').hover(
        function() {
            var imageUrl = $(this).data('full-image');
            var imageTitle = $(this).attr('title') || 'Bildvorschau';
            var imgWidth = $(this).data('width') || 400;
            var imgHeight = $(this).data('height') || 400;
            
            // Erstelle die Vorschau
            var preview = $('<div class="image-preview-popup"></div>').css({
                'position': 'absolute',
                'z-index': 1000,
                'background': 'white',
                'padding': '5px',
                'border': '1px solid #ddd',
                'box-shadow': '0 0 5px rgba(0,0,0,0.2)',
                'max-width': imgWidth + 'px',
                'max-height': imgHeight + 'px'
            }).hide();
            
            var img = $('<img/>').attr('src', imageUrl).css({
                'max-width': '100%',
                'max-height': '100%'
            });
            
            var title = $('<div></div>').text(imageTitle).css({
                'background': '#f9f9f9',
                'padding': '5px',
                'border-top': '1px solid #eee',
                'font-size': '12px',
                'text-align': 'center'
            });
            
            preview.append(img).append(title);
            $('body').append(preview);
            
            // Positioniere die Vorschau
            var offset = $(this).offset();
            preview.css({
                'top': offset.top - 20,
                'left': offset.left + $(this).width() + 20
            }).fadeIn(200);
            
            $(this).data('preview', preview);
        },
        function() {
            // Entferne die Vorschau
            var preview = $(this).data('preview');
            if (preview) {
                preview.fadeOut(200, function() {
                    $(this).remove();
                });
            }
        }
    );
    
    // Zeitauswahl für Posting-Zeit
    if ($('#wc_instagram_posting_time').length) {
        $('#wc_instagram_posting_time').timepicker({
            timeFormat: 'HH:mm',
            interval: 15,
            minTime: '00:00',
            maxTime: '23:45',
            dynamic: false,
            dropdown: true,
            scrollbar: true
        });
    }
    
    // Multiselect-Dropdown für Produktkategorien
    if ($('#wc_instagram_product_categories').length) {
        $('#wc_instagram_product_categories').select2({
            placeholder: "Alle Kategorien",
            allowClear: true
        });
    }
    
    // Klonen des Caption-Texts in die Zwischenablage
    $('.copy-caption').on('click', function() {
        var captionContent = $(this).closest('tr').next('.caption-preview').find('pre').text();
        
        // Erstelle ein temporäres Textarea-Element
        var textarea = document.createElement('textarea');
        textarea.value = captionContent;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Kopiere den Text in die Zwischenablage
            document.execCommand('copy');
            $(this).text('Kopiert!');
            
            // Nach 2 Sekunden wieder zurücksetzen
            setTimeout(function() {
                $(this).text('Caption kopieren');
            }.bind(this), 2000);
        } catch (err) {
            console.error('Konnte nicht kopieren: ', err);
        }
        
        // Entferne das temporäre Element
        document.body.removeChild(textarea);
    });
    
    // Echtzeit-Validierung für API-Schlüssel
    $('.api-key-field').on('blur', function() {
        var field = $(this);
        var apiType = field.data('api-type');
        var apiKey = field.val();
        
        if (!apiKey) {
            return;
        }
        
        var validationStatus = field.parent().find('.validation-status');
        if (!validationStatus.length) {
            validationStatus = $('<span class="validation-status"></span>');
            field.after(validationStatus);
        }
        
        validationStatus.html('<span class="spinner is-active"></span> Validiere...');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'wc_instagram_validate_api_key',
                api_type: apiType,
                api_key: apiKey,
                nonce: wc_instagram_admin.nonce
            },
            success: function(response) {
                if (response.success) {
                    validationStatus.html('<span class="dashicons dashicons-yes" style="color: green;"></span> Gültig');
                } else {
                    validationStatus.html('<span class="dashicons dashicons-no" style="color: red;"></span> ' + response.data.message);
                }
            },
            error: function() {
                validationStatus.html('<span class="dashicons dashicons-no" style="color: red;"></span> Validierung fehlgeschlagen');
            }
        });
    });
    
    // Dashboard-Widget: Mehr anzeigen/weniger anzeigen
    $('#wc_instagram_dashboard_widget .show-more').on('click', function(e) {
        e.preventDefault();
        var $this = $(this);
        var $hiddenItems = $('#wc_instagram_dashboard_widget .hidden-post');
        
        if ($hiddenItems.is(':visible')) {
            $hiddenItems.hide();
            $this.text('Mehr anzeigen');
        } else {
            $hiddenItems.show();
            $this.text('Weniger anzeigen');
        }
    });
});