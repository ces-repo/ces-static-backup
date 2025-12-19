jQuery(document).ready(function($) {
	// Nach dem jQuery(document).ready(function($) { Block einfügen:

// Debug-Funktion
function debugInfo(message, data) {
    if (window.console && window.console.log) {
        console.log(message, data);
    }
}
    // Variablen
    var frame,
        selectedImageId = $("#selected-image-id").val(),
        selectedProducts = [];
    
    // Zähler für ausgewählte Produkte aktualisieren
    function updateSelectedCount() {
        $("#selected-count").text("(" + selectedProducts.length + ")");
    }
    
    // Media Uploader initialisieren
    $("#select-image").on("click", function(e) {
        e.preventDefault();
        
        // Wenn der Media Frame bereits existiert, öffne ihn
        if (frame) {
            frame.open();
            return;
        }
        
        // Media Frame erstellen
        frame = wp.media({
            title: "Tischbild auswählen",
            button: {
                text: "Bild auswählen"
            },
            multiple: false
        });
        
        // Wenn ein Bild ausgewählt wurde
        frame.on("select", function() {
            var attachment = frame.state().get("selection").first().toJSON();
            selectedImageId = attachment.id;
            
            // Bild-Vorschau aktualisieren
            $("#image-preview").html("<img src=\"" + attachment.url + "\" alt=\"Tischbild\">");
            $("#selected-image-id").val(selectedImageId);
            
            // Produktliste zurücksetzen für das neue Bild
            resetProductList();
        });
        
        // Media Frame öffnen
        frame.open();
    });
    
    // Kürzlich verwendete Bilder anklickbar machen
    $(document).on("click", ".recent-image", function() {
        var imageId = $(this).data("id");
        var imageUrl = $(this).find("img").attr("src");
        
        selectedImageId = imageId;
        $("#selected-image-id").val(selectedImageId);
        $("#image-preview").html("<img src=\"" + imageUrl + "\" alt=\"Tischbild\">");
        
        // Produktliste zurücksetzen für das neue Bild
        resetProductList();
    });
    
    // Produktsuche mit Suchen-Button
    $("#search-products").on("click", function() {
        searchProducts();
    });
    
    // Auch bei Enter-Taste im Suchfeld
    $("#product-search").on("keypress", function(e) {
        if(e.which == 13) {
            e.preventDefault();
            searchProducts();
        }
    });
    
    // Kategorie-Filter ändern
    $("#category-filter").on("change", function() {
        if($("#product-search").val().length > 0 || $(this).val() !== "") {
            searchProducts();
        }
    });
    
    // Radio-Button-Verhalten für die Checkboxen im Hinzufügen-Bereich
    $("input[name='add-as']").on("change", function() {
    var selectedValue = $(this).val();
    
    if (selectedValue === "gallery") {
        $("#add-as-featured").prop("checked", false);
        $("#add-as-gallery").prop("checked", true);
    } else if (selectedValue === "featured") {
        $("#add-as-featured").prop("checked", true);
        $("#add-as-gallery").prop("checked", false);
    }
    
    console.log("Änderung erkannt. Gallery checked:", $("#add-as-gallery").prop("checked"));
    console.log("Änderung erkannt. Featured checked:", $("#add-as-featured").prop("checked"));
});
    
    // Nur ausgewählte Produkte anzeigen/ausblenden
    $("#selected-only-filter").on("change", function() {
        if($(this).is(":checked")) {
            $(".product-result-item").each(function() {
                var productId = parseInt($(this).find(".product-checkbox").data("id"));
                if(!isProductSelected(productId)) {
                    $(this).hide();
                }
            });
        } else {
            $(".product-result-item").show();
        }
    });
    
    // Alle sichtbaren Produkte auswählen
    $("#select-all-visible").on("click", function() {
        $(".product-result-item:visible .product-checkbox").each(function() {
            var $checkbox = $(this);
            var productId = parseInt($checkbox.data("id"));
            var productName = $checkbox.data("name");
            
            if(!$checkbox.is(":checked")) {
                $checkbox.prop("checked", true);
                
                if(!isProductSelected(productId)) {
                    addProductToList(productId, productName);
                    selectedProducts.push(productId);
                    updateSelectedCount();
                }
            }
        });
    });
    
    // Auswahl leeren
    $("#clear-selected").on("click", function() {
        resetProductList();
    });
    
    // Produktsuche durchführen
    // Produktsuche durchführen
function searchProducts() {
    var searchTerm = $("#product-search").val();
    var categoryId = $("#category-filter").val();
    
    if(searchTerm.length < 2 && !categoryId) {
        $("#search-results-container").html("<p>Bitte geben Sie mindestens 2 Zeichen ein oder wählen Sie eine Kategorie.</p>");
        return;
    }
    
    $("#search-results-container").html("<p>Suche läuft...</p>");
    
    $.ajax({
        url: table_image_manager.ajax_url,
        type: "GET",
        data: {
            action: "search_products",
            term: searchTerm,
            category: categoryId,
            nonce: table_image_manager.nonce
        },
        success: function(response) {
            console.log("AJAX-Antwort:", response); // Debug-Ausgabe
            
            if(response.success && response.data && response.data.length > 0) {
                displaySearchResults(response.data);
            } else {
                $("#search-results-container").html("<p>Keine Produkte gefunden. Versuchen Sie es mit einem anderen Suchbegriff oder einer anderen Kategorie.</p>");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX-Fehler:", textStatus, errorThrown);
            $("#search-results-container").html("<p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</p>");
        }
    });
}
    
    // Suchergebnisse anzeigen
    function displaySearchResults(products) {
        var resultsHtml = "<div class='product-results-grid'>";
        
        $.each(products, function(index, product) {
            var isSelected = isProductSelected(product.id);
            
            resultsHtml += "<div class='product-result-item'>";
            resultsHtml += "<label>";
            resultsHtml += "<input type='checkbox' class='product-checkbox' data-id='" + product.id + "' data-name='" + product.name + "' " + (isSelected ? "checked" : "") + ">";
            
            if(product.thumbnail) {
                resultsHtml += "<img src='" + product.thumbnail + "' alt='" + product.name + "' class='product-thumbnail'>";
            }
            
            resultsHtml += "<span class='product-name'>" + product.name + "</span>";
            
            if(product.sku) {
                resultsHtml += "<span class='product-sku'>SKU: " + product.sku + "</span>";
            }
            
            if(product.categories) {
                resultsHtml += "<span class='product-categories'>" + product.categories + "</span>";
            }
            
            resultsHtml += "</label>";
            resultsHtml += "</div>";
        });
        
        resultsHtml += "</div>";
        
        $("#search-results-container").html(resultsHtml);
        
        // "Nur ausgewählte anzeigen" Filter anwenden, falls aktiviert
        if($("#selected-only-filter").is(":checked")) {
            $(".product-result-item").each(function() {
                var productId = parseInt($(this).find(".product-checkbox").data("id"));
                if(!isProductSelected(productId)) {
                    $(this).hide();
                }
            });
        }
        
        // Event-Handler für Checkboxen
        $(".product-checkbox").on("change", function() {
            var $checkbox = $(this),
                productId = parseInt($checkbox.data("id")),
                productName = $checkbox.data("name");
            
            if($checkbox.is(":checked")) {
                // Produkt hinzufügen, wenn es noch nicht in der Liste ist
                if(!isProductSelected(productId)) {
                    addProductToList(productId, productName);
                    selectedProducts.push(productId);
                    updateSelectedCount();
                }
            } else {
                // Produkt aus der Liste entfernen
                removeProductFromList(productId);
            }
        });
    }
    
    // Prüfen, ob ein Produkt bereits ausgewählt ist
    function isProductSelected(productId) {
        return selectedProducts.indexOf(parseInt(productId)) !== -1;
    }
    
    // Produkt zur Liste hinzufügen
    function addProductToList(productId, productName) {
        $("#product-list").append(
            "<li data-product-id=\"" + productId + "\">" + 
            productName + 
            " <a href=\"#\" class=\"remove-product\">✕</a></li>"
        );
        updateSelectedCount();
    }
    
    // Produkt aus der Liste entfernen
    function removeProductFromList(productId) {
        var index = selectedProducts.indexOf(parseInt(productId));
        
        if (index !== -1) {
            selectedProducts.splice(index, 1);
        }
        
        $("#product-list li[data-product-id='" + productId + "']").remove();
        
        // Auch Checkbox im Suchergebnis aktualisieren
        $(".product-checkbox[data-id='" + productId + "']").prop("checked", false);
        
        updateSelectedCount();
    }
    
    // Produktliste zurücksetzen
    function resetProductList() {
        selectedProducts = [];
        $("#product-list").empty();
        $("#search-results-container").html("<p>Geben Sie einen Suchbegriff ein und klicken Sie auf \"Suchen\"</p>");
        $("#product-search").val("");
        $(".product-checkbox").prop("checked", false);
        updateSelectedCount();
    }
    
    // Event-Handler für das Entfernen eines Produkts
    $(document).on("click", ".remove-product", function(e) {
        e.preventDefault();
        
        var listItem = $(this).parent(),
            productId = parseInt(listItem.data("product-id"));
        
        removeProductFromList(productId);
    });
    
    // Bild zu Produkten hinzufügen
    $("#add-image-button").on("click", function() {
    if (!selectedImageId) {
        $("#response-message").html("<div class=\"notice notice-error\"><p>Bitte wählen Sie ein Bild aus.</p></div>");
        return;
    }
    
    if (selectedProducts.length === 0) {
        $("#response-message").html("<div class=\"notice notice-error\"><p>Bitte wählen Sie mindestens ein Produkt aus.</p></div>");
        return;
    }
    
    // Prüfen, ob als Hauptbild oder Galeriebild hinzugefügt werden soll
    var addAsFeatured = $("#add-as-featured").is(":checked");
    
    // Debug-Ausgabe im Browser
    console.log("Als Hauptbild festlegen: ", addAsFeatured);
    console.log("Checkbox ist checked: ", $("#add-as-featured").prop("checked"));
    
    $.ajax({
        url: table_image_manager.ajax_url,
        type: "POST",
        data: {
            action: "add_image_to_products",
            image_id: selectedImageId,
            product_ids: selectedProducts,
            add_as_featured: addAsFeatured, // Dieser Wert sollte als String "true" oder "false" übergeben werden
            nonce: table_image_manager.nonce
        },
        beforeSend: function() {
            $("#add-image-button").prop("disabled", true).text("Wird verarbeitet...");
        },
            success: function(response) {
                if (response.success) {
                    $("#response-message").html("<div class=\"notice notice-success\"><p>" + response.data.message + "</p></div>");
                    
                    // Liste der kürzlich verwendeten Bilder aktualisieren
                    $("#recent-images").html(response.data.recent_images);
                    
                    // Nach erfolgreichem Hinzufügen des Bildes die Produktliste zurücksetzen
                    resetProductList();
                } else {
                    $("#response-message").html("<div class=\"notice notice-error\"><p>" + response.data.message + "</p></div>");
                }
                
                $("#add-image-button").prop("disabled", false).text("Bild zu ausgewählten Produkten hinzufügen");
            },
            error: function() {
                $("#response-message").html("<div class=\"notice notice-error\"><p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</p></div>");
                $("#add-image-button").prop("disabled", false).text("Bild zu ausgewählten Produkten hinzufügen");
            }
        });
    });
});