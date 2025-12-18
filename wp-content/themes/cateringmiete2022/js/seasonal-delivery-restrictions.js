/**
 * Seasonal Delivery Restrictions for CateringMiete
 * 
 * Handles special time restrictions for delivery/pickup:
 * - High season (May-September & December): Only large time windows available
 * - Saturdays: No specific time restrictions (ganztägig)
 * - Company Closure: December 24, 2025 - January 4, 2026
 */

jQuery(function($) {
    // Only execute on checkout page
    if (!$('body').hasClass('woocommerce-checkout')) {
        return;
    }

    // Diese Funktion prüft, ob das Datum in der Hochsaison liegt
    function isHighSeason(dateObj) {
        let month = dateObj.getMonth();
        // Mai bis September (Monate 4-8) und Dezember (Monat 11)
        return (month >= 4 && month <= 8) || month === 11;
    }

    // Diese Funktion prüft, ob das Datum ein Samstag ist
    function isSaturday(dateObj) {
        return dateObj.getDay() === 6; // 6 = Samstag
    }

    // Diese Funktion prüft, ob das Datum in die Betriebsferien fällt
    function isCompanyClosed(dateObj) {
        // Betriebsferien: 24.12.2025 bis 4.1.2026
        let closedStart = new Date(2025, 11, 24); // Monat ist 0-basiert, 11 = Dezember
        let closedEnd = new Date(2026, 0, 4);     // 0 = Januar
        
        // Zeitteile auf Mitternacht setzen für korrekte Datumsvergleiche
        let checkDate = new Date(dateObj);
        checkDate.setHours(0, 0, 0, 0);
        closedStart.setHours(0, 0, 0, 0);
        closedEnd.setHours(0, 0, 0, 0);
        
        return checkDate >= closedStart && checkDate <= closedEnd;
    }

    // Event-Handler für Datums- und Zeitänderungen
    function updateDeliveryOptions() {
        // Alle Datumsfelder auslesen (Lieferung UND Selbstabholung)
        let dateFromLiefer = $('#additional_date_from_liefer').val();
        let dateToLiefer = $('#additional_date_to_liefer').val();
        let dateAbholung = $('#additional_abholdatum').val();
        let dateRuckgabe = $('#additional_ruckgabedatum').val();
        
        let timeFrom = $('#additional_time_from_liefer').val();
        let timeTo = $('#additional_time_to_liefer').val();
        
        // Debug-Ausgabe
        console.log('Checking dates - Liefer:', dateFromLiefer, dateToLiefer);
        console.log('Checking dates - Abholung:', dateAbholung, dateRuckgabe);
        console.log('Checking times:', timeFrom, timeTo);
        
        // Array mit allen zu prüfenden Daten erstellen
        let datesToCheck = [];
        let dateObjects = {};
        
        if (dateFromLiefer) {
            let parts = dateFromLiefer.split('-');
            dateObjects.fromLiefer = new Date(parts[2], parts[1] - 1, parts[0]);
            datesToCheck.push({date: dateObjects.fromLiefer, type: 'Lieferdatum', field: 'additional_date_from_liefer'});
        }
        if (dateToLiefer) {
            let parts = dateToLiefer.split('-');
            dateObjects.toLiefer = new Date(parts[2], parts[1] - 1, parts[0]);
            datesToCheck.push({date: dateObjects.toLiefer, type: 'Rückgabedatum (Lieferung)', field: 'additional_date_to_liefer'});
        }
        if (dateAbholung) {
            let parts = dateAbholung.split('-');
            dateObjects.abholung = new Date(parts[2], parts[1] - 1, parts[0]);
            datesToCheck.push({date: dateObjects.abholung, type: 'Abholdatum', field: 'additional_abholdatum'});
        }
        if (dateRuckgabe) {
            let parts = dateRuckgabe.split('-');
            dateObjects.ruckgabe = new Date(parts[2], parts[1] - 1, parts[0]);
            datesToCheck.push({date: dateObjects.ruckgabe, type: 'Rückgabedatum', field: 'additional_ruckgabedatum'});
        }
        
        // Wenn keine Daten vorhanden, abbrechen
        if (datesToCheck.length === 0) return;
        
        // Prüfen auf Betriebsferien (hat höchste Priorität!)
        let closedDates = [];
        datesToCheck.forEach(function(item) {
            if (isCompanyClosed(new Date(item.date))) {
                closedDates.push(item);
            }
        });
        
        console.log('Company closed dates:', closedDates);
        
        // Entferne bestehende Hinweise und rote Markierungen
        $('.delivery-notice').remove();
        $('#additional_date_from_liefer, #additional_date_to_liefer, #additional_abholdatum, #additional_ruckgabedatum').css('border', '');
        
        // Fall 0: Betriebsferien (höchste Priorität!)
        if (closedDates.length > 0) {
            // Betroffene Felder rot markieren
            closedDates.forEach(function(item) {
                $('#' + item.field).css('border', '2px solid red');
            });
            
            // Alle Optionen deaktivieren
            $('#lieferzeitraum_time option').prop('disabled', true).hide();
            $('#additional_time_from_liefer option, #additional_time_to_liefer option').prop('disabled', true).hide();
            
            // Deutliche Warnung anzeigen
            let affectedDatesText = closedDates.map(function(item) {
                return item.type;
            }).join(', ');
            
            let message = '<div class="delivery-notice company-closed" style="background: #ffebee; border: 2px solid #c62828; padding: 15px; margin: 10px 0; border-radius: 4px;">' +
                         '<strong style="color: #c62828; font-size: 16px;">⚠️ BETRIEBSFERIEN</strong><br>' +
                         '<span style="color: #c62828;">Vom 24.12.2025 bis 04.01.2026 sind wir geschlossen.<br>' +
                         'In diesem Zeitraum sind keine Lieferungen, Abholungen oder Rückgaben möglich.<br>' +
                         '<strong>Betroffene Daten: ' + affectedDatesText + '</strong><br>' +
                         'Bitte wählen Sie ein anderes Datum.</span>' +
                         '</div>';
            
            // Warnung bei den Versanddetails einfügen - immer sichtbar
            if ($('.shipping_method_description').length) {
                $('.shipping_method_description').first().after(message);
            } else {
                // Fallback: Vor den ersten sichtbaren Datumsfeldern
                $('form.checkout').find('#additional_date_from_liefer, #additional_abholdatum').filter(':visible').first().parent().before(message);
            }
            
            return; // Keine weiteren Prüfungen nötig
        }
        
        // Ab hier: Nur Prüfungen für Lieferung (wenn Lieferdaten vorhanden)
        if (!dateFromLiefer && !dateToLiefer) {
            return; // Keine Lieferdaten, also keine weiteren Prüfungen
        }
        
        let fromDate = dateObjects.fromLiefer;
        let toDate = dateObjects.toLiefer;
        
        // Prüfen, ob Hochsaison
        let inHighSeason = (fromDate && isHighSeason(fromDate)) || (toDate && isHighSeason(toDate));
        console.log('High season:', inHighSeason);
        
        // Prüfen auf Samstag
        let isFromSaturday = fromDate && isSaturday(fromDate);
        let isToSaturday = toDate && isSaturday(toDate);
        console.log('Saturday delivery/pickup:', isFromSaturday, isToSaturday);
        
        // Fall 1: Samstag Lieferung oder Abholung (hat Vorrang vor Hochsaison)
        if (isFromSaturday || isToSaturday) {
            // An Samstagen - keine Zeiteingrenzung möglich
            $('#lieferzeitraum_time option[value="1"]').prop('disabled', true).hide();
            $('#lieferzeitraum_time option[value="2"]').prop('disabled', true).hide();
            
            // Auf 4-Stunden-Zeitfenster umstellen (wenn noch nicht ausgewählt)
            if ($('#lieferzeitraum_time').val() !== "4") {
                $('#lieferzeitraum_time').val("4").trigger('change');
                
                // Auch die anderen Zeitfelder zwangsweise auf das große Zeitfenster stellen
                if (isFromSaturday) {
                    $('#additional_time_from_liefer').val('8:00 - 17:00 Uhr').prop('disabled', true);
                }
                if (isToSaturday) {
                    $('#additional_time_to_liefer').val('8:00 - 17:00 Uhr').prop('disabled', true);
                }
            }
            
            // Stärkerer Eingriff: Alle kleinen Zeitfenster in den Zeitdropdowns ausblenden
            $('#additional_time_from_liefer option, #additional_time_to_liefer option').each(function() {
                // Nur das ganztägige Zeitfenster zeigen
                if ($(this).val() !== '8:00 - 17:00 Uhr') {
                    $(this).prop('disabled', true).hide();
                } else {
                    $(this).prop('disabled', false).show();
                }
            });
            
            $('#lieferzeitraum_time').after('<p class="delivery-notice saturday" style="color: #ff6600;">An Samstagen erfolgt die Lieferung/Abholung ohne feste Zeiteingrenzung.<br>Der Fahrer startet am Morgen und geht alles hintereinander durch</p>');
        }
        // Fall 2: Hochsaison (Mai-September & Dezember)
        else if (inHighSeason) {
            // In der Hochsaison - nur große Zeitfenster erlauben
            $('#lieferzeitraum_time option[value="1"]').prop('disabled', true).hide();
            $('#lieferzeitraum_time option[value="2"]').prop('disabled', true).hide();
            
            // Auf 4-Stunden-Zeitfenster umstellen (wenn noch nicht ausgewählt)
            if ($('#lieferzeitraum_time').val() !== "4") {
                $('#lieferzeitraum_time').val("4").trigger('change');
            }
            
            // Info-Text anzeigen
            $('#lieferzeitraum_time').after('<p class="delivery-notice high-season" style="color: #ff6600;">In der Hochsaison (Mai-September & Dezember) sind keine weiteren Zeiteingrenzungen verfügbar.</p>');
        }
        // Fall 3: Normale Zeiten außerhalb der Hochsaison
        else {
            // Außerhalb der Hochsaison - alle Optionen freigeben
            $('#lieferzeitraum_time option[value="1"]').prop('disabled', false).show();
            $('#lieferzeitraum_time option[value="2"]').prop('disabled', false).show();
        }
    }

    // Funktion zur Überwachung der Daten- und Zeitfelder
    function setupEventListeners() {
        // Event-Listener für Änderungen an Datums- und Zeitfeldern (ALLE Felder!)
        $('body').on('change', '#additional_date_from_liefer, #additional_date_to_liefer, #additional_abholdatum, #additional_ruckgabedatum, #additional_time_from_liefer, #additional_time_to_liefer', function() {
            console.log('Field changed:', this.id, 'New value:', $(this).val());
            updateDeliveryOptions();
        });
        
        // Spezieller Event-Listener für lieferzeitraum_time, da dies von updateDeliveryOptions geändert werden kann
        $('body').on('change', '#lieferzeitraum_time', function() {
            // Nur wenn die Änderung von Benutzer kommt (nicht von unserem Skript)
            if (!$(this).data('programmatic-change')) {
                console.log('Lieferzeitraum changed by user:', $(this).val());
                // Zeitfelder aktualisieren
                updateDeliveryOptions();
            }
        });
    }
    
    // Bei Dokumentenladung
    $(document).ready(function() {
        console.log('Seasonal delivery restrictions initialized');
        
        // Event-Listener einrichten
        setupEventListeners();
        
        // Die Originalfunktion für Zeitanzeige finden und überschreiben
        if (typeof show_hide_time === 'function') {
            // Die ursprüngliche Funktion speichern
            var original_show_hide_time = show_hide_time;
            
            // Überschreiben mit unserer erweiterten Version
            window.show_hide_time = function(val) {
                // Original-Funktionalität aufrufen
                original_show_hide_time(val);
                
                // Unsere zusätzliche Prüfung durchführen
                setTimeout(function() {
                    updateDeliveryOptions();
                }, 100);
            };
            
            console.log('Original show_hide_time function overridden');
        }
        
        // Bei Seitenladung und nach jedem AJAX-Abschluss prüfen
        $(document).ajaxComplete(function(event, xhr, settings) {
            if (settings.url && settings.url.indexOf('wc-ajax=update_order_review') !== -1) {
                console.log('Order review updated, checking delivery options');
                
                // Verzögerung hinzufügen, um sicherzustellen, dass alle Elemente geladen sind
                setTimeout(function() {
                    if ($('#additional_date_from_liefer').length || $('#additional_abholdatum').length) {
                        updateDeliveryOptions();
                    }
                }, 500);
            }
        });
        
        // Zusätzlich das #lieferzeitraum_time Dropdown überwachen
        $('body').on('change', '#lieferzeitraum_time', function() {
            setTimeout(function() {
                console.log('lieferzeitraum_time changed, enforcing our rules');
                updateDeliveryOptions();
            }, 100);
        });
        
        // Initial prüfen
        if ($('#additional_date_from_liefer').length || $('#additional_abholdatum').length) {
            setTimeout(function() {
                updateDeliveryOptions();
            }, 500);
        }
    });
    
    // Ursprüngliche Funktionalität überschreiben
    function injectOverrides() {
        // Datepicker Ereignis abfangen
        if ($.datepicker && $.datepicker._attachments) {
            var originalAttachments = $.datepicker._attachments;
            $.datepicker._attachments = function(input, inst) {
                originalAttachments.call(this, input, inst);
                
                // Nach Datumswahl unsere Funktion aufrufen
                $(input).on('change', function() {
                    console.log('Datepicker date changed:', this.id);
                    setTimeout(updateDeliveryOptions, 100);
                });
            };
        }
    }
    
    // Überschreibungen injizieren
    injectOverrides();
});