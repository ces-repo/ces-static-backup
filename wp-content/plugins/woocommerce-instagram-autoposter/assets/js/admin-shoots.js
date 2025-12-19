(function($) {
    // Document ready
    $(document).ready(function() {
        // Formular absenden
        $('#wc-instagram-add-shooting-form').on('submit', function(e) {
            e.preventDefault();
            
            // Button deaktivieren und Spinner anzeigen
            $('#submit-shooting').prop('disabled', true);
            $('.spinner').addClass('is-active');
            
            // AJAX-Anfrage
            $.ajax({
    url: wc_instagram_shoots.ajax_url,
    type: 'POST',
    data: {
        action: 'wc_instagram_register_shooting',
        nonce: wc_instagram_shoots.nonce,
        shooting_name: $('#shooting_name').val(),
        directory_path: $('#directory_path').val(),
        credit_role: $('input[name="credit_role[]"]').map(function() {
            return $(this).val();
        }).get(),
        credit_name: $('input[name="credit_name[]"]').map(function() {
            return $(this).val();
        }).get()
    },
                success: function(response) {
                    if (response.success) {
                        alert(response.data.message);
                        window.location.href = response.data.redirect;
                    } else {
                        alert(response.data.message);
                        $('#submit-shooting').prop('disabled', false);
                        $('.spinner').removeClass('is-active');
                    }
                },
                error: function() {
                    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                    $('#submit-shooting').prop('disabled', false);
                    $('.spinner').removeClass('is-active');
                }
            });
        });
        
        // Credit-Zeilen hinzufügen/entfernen
$('#add-credit').on('click', function() {
    var newRow = $('<div class="credit-row">' +
        '<input type="text" name="credit_role[]" placeholder="Rolle (z.B. Fotograf)" class="medium-text">' +
        '<input type="text" name="credit_name[]" placeholder="Name oder @instagram-handle" class="medium-text">' +
        '<button type="button" class="button remove-credit">Entfernen</button>' +
        '</div>');
    
    $('#credits-container').append(newRow);
});
// Event-Handler für den Import-Button
$('.import-to-media').on('click', function() {
    var shootingId = $(this).data('id');
    var $button = $(this);
    var originalText = $button.text();
    
    if (confirm(wc_instagram_shoots.confirm_import)) {
        // Button deaktivieren und Ladetext anzeigen
        $button.text('Importiere...').prop('disabled', true);
        
        $.ajax({
            url: wc_instagram_shoots.ajax_url,
            type: 'POST',
            data: {
                action: 'wc_instagram_import_to_media_library',
                nonce: wc_instagram_shoots.nonce,
                shooting_id: shootingId
            },
            success: function(response) {
                if (response.success) {
                    alert(response.data.message);
                } else {
                    // Detailliertere Fehlermeldung
                    var errorMsg = response.data && response.data.message ? 
                                   response.data.message : 
                                   'Unbekannter Fehler beim Import.';
                    console.error('Fehlerdetails:', response);
                    alert('Fehler: ' + errorMsg);
                }
                // Button zurücksetzen
                $button.text(originalText).prop('disabled', false);
            },
            error: function(xhr, status, error) {
                // Zeige detaillierte Fehlerinformationen
                console.error('AJAX-Fehler:', status, error);
                console.error('Antwort:', xhr.responseText);
                alert('Serverfehler beim Import: ' + error + '\nBitte prüfe die Konsole für Details.');
                
                // Button zurücksetzen
                $button.text(originalText).prop('disabled', false);
            }
        });
    }
});
// Event-Delegation für dynamisch hinzugefügte Remove-Buttons
$(document).on('click', '.remove-credit', function() {
    $(this).closest('.credit-row').remove();
});
        
        // Shooting löschen
        $('.delete-shooting').on('click', function() {
            var shootingId = $(this).data('id');
            var row = $(this).closest('tr');
            
            if (confirm(wc_instagram_shoots.confirm_delete)) {
                $.ajax({
                    url: wc_instagram_shoots.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wc_instagram_delete_shooting',
                        nonce: wc_instagram_shoots.nonce,
                        shooting_id: shootingId
                    },
                    success: function(response) {
                        if (response.success) {
                            alert(response.data.message);
                            row.fadeOut(400, function() {
                                row.remove();
                            });
                        } else {
                            alert(response.data.message);
                        }
                    },
                    error: function() {
                        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                    }
                });
            }
        });
        
        // Shooting aktivieren/deaktivieren
        $('.toggle-shooting').on('click', function() {
            var button = $(this);
            var shootingId = button.data('id');
            var currentActive = button.data('active');
            
            $.ajax({
                url: wc_instagram_shoots.ajax_url,
                type: 'POST',
                data: {
                    action: 'wc_instagram_toggle_shooting',
                    nonce: wc_instagram_shoots.nonce,
                    shooting_id: shootingId,
                    active: currentActive
                },
                success: function(response) {
                    if (response.success) {
                        // Status aktualisieren
                        var statusCell = button.closest('tr').find('td:nth-child(6)');
                        if (response.data.new_active) {
                            statusCell.html('<span class="status-active">Aktiv</span>');
                            button.text('Deaktivieren');
                        } else {
                            statusCell.html('<span class="status-inactive">Inaktiv</span>');
                            button.text('Aktivieren');
                        }
                        
                        // Button aktualisieren
                        button.data('active', response.data.new_active);
                        
                        // Benachrichtigung anzeigen
                        alert(response.data.message);
                    } else {
                        alert(response.data.message);
                    }
                },
                error: function() {
                    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                }
            });
        });
        
        // Post planen
        $('.plan-post').on('click', function() {
            var shootingId = $(this).data('id');
            
            if (confirm(wc_instagram_shoots.confirm_plan)) {
                // Ladeanzeige
                $(this).text('Wird geplant...');
                $(this).prop('disabled', true);
                
                $.ajax({
                    url: wc_instagram_shoots.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wc_instagram_plan_shoot_post',
                        nonce: wc_instagram_shoots.nonce,
                        shooting_id: shootingId
                    },
                    success: function(response) {
                        if (response.success) {
                            alert(response.data.message);
                            window.location.href = response.data.redirect;
                        } else {
                            alert(response.data.message);
                            $(this).text('Post planen');
                            $(this).prop('disabled', false);
                        }
                    },
                    error: function() {
                        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                        $(this).text('Post planen');
                        $(this).prop('disabled', false);
                    }
                });
            }
        });
        
        // Post Vorschau/Anzeigen
        $('.view-post').on('click', function() {
            var postId = $(this).data('id');
            
            // Hier könnte eine Modal-Vorschau implementiert werden
            alert('Vorschau-Funktion wird in der nächsten Version verfügbar sein.');
        });
        
        // Post löschen
        $('.delete-post').on('click', function() {
            var postId = $(this).data('id');
            var row = $(this).closest('tr');
            
            if (confirm('Sind Sie sicher, dass Sie diesen geplanten Post löschen möchten?')) {
                // AJAX-Anfrage zum Löschen des Posts
                $.ajax({
                    url: wc_instagram_shoots.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wc_instagram_delete_shoot_post',
                        nonce: wc_instagram_shoots.nonce,
                        post_id: postId
                    },
                    success: function(response) {
                        if (response.success) {
                            alert(response.data.message);
                            row.fadeOut(400, function() {
                                row.remove();
                            });
                        } else {
                            alert(response.data.message);
                        }
                    },
                    error: function() {
                        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                    }
                });
            }
        });
    });
})(jQuery);
							