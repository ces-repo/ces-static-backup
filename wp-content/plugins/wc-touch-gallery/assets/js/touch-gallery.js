/**
 * Touch Gallery JavaScript - KORRIGIERT für Bild-Anzeige
 * @package WC_Touch_Gallery
 * @version 1.0.0
 */

class TouchGallery {
    constructor() {
        this.currentView = 'overview';
        this.currentShooting = null;
        this.currentImages = [];
        this.currentImageIndex = 0;
        this.isLoading = false;
        
        // Touch-Gesten
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.swipeThreshold = 80;
        this.tapThreshold = 500;
        
        this.elements = {};
        this.data = {};
        
        console.log('🎯 TouchGallery: Initialisierung gestartet');
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initAfterDOM());
        } else {
            this.initAfterDOM();
        }
    }
    
    initAfterDOM() {
        console.log('🎯 TouchGallery: DOM Ready - starte Initialisierung');
        
        this.cacheElements();
        this.loadInitialData();
        this.bindEvents();
        this.initializeUI();
        
        window.touchGallery = this;
        window.touchGalleryLoaded = true;
        
        console.log('✅ TouchGallery: Vollständig initialisiert');
    }
    
    cacheElements() {
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            shootingsOverview: document.getElementById('shootingsOverview'),
            shootingGallery: document.getElementById('shootingGallery'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            
            backButton: document.getElementById('backButton'),
            galleryTitle: document.getElementById('galleryTitle'),
            shootingCounter: document.getElementById('shootingCounter'),
            
            shootingsGrid: document.getElementById('shootingsGrid'),
            galleryImagesGrid: document.getElementById('galleryImagesGrid'),
            
            lightbox: document.getElementById('lightbox'),
            lightboxImage: document.getElementById('lightboxImage'),
            lightboxClose: document.getElementById('lightboxClose'),
            lightboxPrev: document.getElementById('lightboxPrev'),
            lightboxNext: document.getElementById('lightboxNext'),
            lightboxTitle: document.getElementById('lightboxTitle'),
            imageCounter: document.getElementById('imageCounter'),
            
            swipeHint: document.getElementById('swipeHint')
        };
        
        console.log('📦 TouchGallery: Elemente gecacht:', Object.keys(this.elements).length);
    }
    
    loadInitialData() {
        const dataElement = document.getElementById('initialData');
        if (dataElement) {
            try {
                this.data = JSON.parse(dataElement.textContent);
                console.log('📊 TouchGallery: Daten geladen -', this.data.shootings.length, 'Shootings');
            } catch (e) {
                console.error('❌ TouchGallery: JSON-Parse Fehler:', e);
                this.showError('Fehler beim Laden der initialen Daten');
                return false;
            }
        } else {
            console.error('❌ TouchGallery: initialData Element nicht gefunden');
            this.showError('Keine Daten verfügbar');
            return false;
        }
        
        return true;
    }
    
    bindEvents() {
        console.log('🔗 TouchGallery: Binde Events');
        
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => {
                this.showShootingsOverview();
            });
        }
        
        if (this.elements.lightboxClose) {
            this.elements.lightboxClose.addEventListener('click', () => {
                this.closeLightbox();
            });
        }
        
        if (this.elements.lightboxPrev) {
            this.elements.lightboxPrev.addEventListener('click', () => {
                this.showPreviousImage();
            });
        }
        
        if (this.elements.lightboxNext) {
            this.elements.lightboxNext.addEventListener('click', () => {
                this.showNextImage();
            });
        }
        
        if (this.elements.lightbox) {
            this.elements.lightbox.addEventListener('click', (e) => {
                if (e.target === this.elements.lightbox || e.target.classList.contains('modal-backdrop')) {
                    this.closeLightbox();
                }
            });
        }
        
        this.bindTouchEvents();
        this.bindKeyboardEvents();
        this.bindShootingCards();
        
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    bindTouchEvents() {
        const touchOptions = { passive: true };
        
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, touchOptions);
        
        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, touchOptions);
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    bindShootingCards() {
        const cards = document.querySelectorAll('.shooting-card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const shootingName = card.getAttribute('data-shooting-name');
                if (shootingName) {
                    this.showShootingGallery(shootingName);
                }
            });
            
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });
        
        console.log('🎮 TouchGallery: Events für', cards.length, 'Shooting Cards gebunden');
    }
    
    initializeUI() {
        console.log('🎨 TouchGallery: UI wird initialisiert');
        
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.style.display = 'none';
            }
            this.showShootingsOverview();
        }, 800);
    }
    
    showShootingsOverview() {
        console.log('📱 TouchGallery: Zeige Shootings-Übersicht');
        
        this.currentView = 'overview';
        this.currentShooting = null;
        
        this.hideAllViews();
        
        if (this.elements.shootingsOverview) {
            this.elements.shootingsOverview.style.display = 'block';
        }
        
        if (this.elements.backButton) {
            this.elements.backButton.classList.add('hidden');
        }
        
        if (this.elements.galleryTitle) {
            this.elements.galleryTitle.textContent = 'CES Fotogalerie';
        }
        
        if (this.elements.shootingCounter) {
            this.elements.shootingCounter.textContent = `${this.data.shootings.length} Shootings`;
        }
    }
    
    async showShootingGallery(shootingName) {
        console.log('🎯 TouchGallery: Lade Shooting:', shootingName);
        
        if (this.isLoading) {
            console.log('⚠️ TouchGallery: Bereits am Laden, überspringe');
            return;
        }
        
        this.isLoading = true;
        this.currentView = 'gallery';
        this.currentShooting = shootingName;
        
        this.showLoading();
        
        try {
            const shootingData = await this.fetchShootingImages(shootingName);
            
            if (!shootingData || !shootingData.images || shootingData.images.length === 0) {
                throw new Error('Keine Bilder im Shooting gefunden');
            }
            
            this.currentImages = shootingData.images;
            
            // Header aktualisieren
            this.updateGalleryHeader(shootingData);
            
            // WICHTIG: Bilder rendern und sichtbar machen
            this.renderGalleryImages(shootingData.images);
            
            // View umschalten
            this.hideAllViews();
            
            // Gallery sichtbar machen - FORCE VISIBILITY
            if (this.elements.shootingGallery) {
                this.elements.shootingGallery.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
            }
            
            if (this.elements.galleryImagesGrid) {
                this.elements.galleryImagesGrid.style.cssText = 'display: grid !important; visibility: visible !important; opacity: 1 !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important;';
            }
            
            console.log('✅ TouchGallery: Shooting geladen -', shootingData.images.length, 'Bilder');
            
        } catch (error) {
            console.error('❌ TouchGallery: Fehler beim Laden:', error);
            this.showError(`Shooting "${shootingName}" konnte nicht geladen werden: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    updateGalleryHeader(shootingData) {
        if (this.elements.backButton) {
            this.elements.backButton.classList.remove('hidden');
        }
        
        if (this.elements.galleryTitle) {
            this.elements.galleryTitle.textContent = shootingData.shooting_name || shootingData.name || 'Galerie';
        }
        
        if (this.elements.shootingCounter) {
            this.elements.shootingCounter.textContent = `${shootingData.image_count || shootingData.images.length} Bilder`;
        }
    }
    
    /**
     * KORRIGIERTE Bilder-Render Funktion
     */
    renderGalleryImages(images) {
        console.log('🖼️ TouchGallery: Rendere', images.length, 'Bilder');
        
        if (!this.elements.galleryImagesGrid) {
            console.error('❌ Gallery Images Grid nicht gefunden!');
            return;
        }
        
        // Grid leeren
        this.elements.galleryImagesGrid.innerHTML = '';
        
        // Jedes Bild einzeln erstellen
        images.forEach((imageUrl, index) => {
            const imageItem = this.createGalleryImageItem(imageUrl, index);
            this.elements.galleryImagesGrid.appendChild(imageItem);
        });
        
        // FORCE VISIBILITY für alle erstellten Elemente
        setTimeout(() => {
            this.forceGalleryVisibility();
        }, 100);
        
        console.log('✅ TouchGallery: Gallery Grid gerendert mit', images.length, 'Bildern');
    }
    
    /**
     * KORRIGIERTE Image-Item Erstellung
     */
    createGalleryImageItem(imageUrl, index) {
        console.log(`🎨 Erstelle Bild ${index + 1}:`, imageUrl);
        
        const item = document.createElement('div');
        item.className = 'gallery-image-item';
        item.setAttribute('data-image-index', index);
        
        // FORCE STYLES direkt setzen
        item.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            aspect-ratio: 4/3 !important;
            border-radius: 20px !important;
            overflow: hidden !important;
            cursor: pointer !important;
            transition: transform 0.3s ease !important;
            box-shadow: 0 10px 25px rgba(196, 69, 105, 0.15) !important;
            background: white !important;
            border: 2px solid #c44569 !important;
        `;
        
        const img = document.createElement('img');
        img.className = 'gallery-image';
        img.src = imageUrl;
        img.alt = `Bild ${index + 1}`;
        img.loading = 'lazy';
        
        // FORCE STYLES für Bild
        img.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // Event Listeners
        item.addEventListener('click', () => {
            console.log('🖼️ Bild geklickt:', index + 1);
            this.openLightbox(index);
        });
        
        item.addEventListener('touchstart', () => {
            item.style.transform = 'scale(0.97)';
        });
        
        item.addEventListener('touchend', () => {
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        });
        
        // Bild-Load Event
        img.onload = () => {
            console.log(`✅ Bild ${index + 1} geladen`);
        };
        
        img.onerror = () => {
            console.error(`❌ Bild ${index + 1} konnte nicht geladen werden:`, imageUrl);
            item.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #c44569; font-size: 2rem;">❌</div>`;
        };
        
        item.appendChild(img);
        return item;
    }
    
    /**
     * NEUE Funktion: Gallery Sichtbarkeit forcieren
     */
    forceGalleryVisibility() {
        console.log('🔧 Force Gallery Visibility');
        
        // Gallery Grid
        if (this.elements.galleryImagesGrid) {
            this.elements.galleryImagesGrid.style.cssText += `
                display: grid !important;
                visibility: visible !important;
                opacity: 1 !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 30px !important;
                max-width: 1600px !important;
                margin: 0 auto !important;
            `;
        }
        
        // Alle Image Items
        const imageItems = document.querySelectorAll('.gallery-image-item');
        imageItems.forEach((item, index) => {
            item.style.cssText += `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                border: 2px solid #c44569 !important;
            `;
            
            const img = item.querySelector('img');
            if (img) {
                img.style.cssText += `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;
            }
        });
        
        console.log('✅ Sichtbarkeit für', imageItems.length, 'Bild-Items forciert');
    }
    
    async fetchShootingImages(shootingName) {
        console.log('📡 AJAX: Lade Bilder für', shootingName);
        
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('action', 'load_shooting_images');
            formData.append('nonce', this.data.nonce);
            formData.append('shooting_name', shootingName);
            
            fetch(this.data.ajaxurl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('📡 AJAX Response:', data);
                
                if (data.success) {
                    resolve({
                        shooting_name: data.data.shooting_name,
                        image_count: data.data.image_count,
                        images: data.data.images
                    });
                } else {
                    reject(new Error(data.data?.message || 'Unbekannter AJAX-Fehler'));
                }
            })
            .catch(error => {
                console.error('❌ AJAX Fetch Error:', error);
                reject(error);
            });
        });
    }
    
    // LIGHTBOX FUNKTIONEN
    openLightbox(imageIndex) {
        if (!this.currentImages || this.currentImages.length === 0) return;
        
        console.log('🔍 TouchGallery: Öffne Lightbox für Bild', imageIndex + 1);
        
        this.currentImageIndex = imageIndex;
        this.updateLightboxImage();
        
        if (this.elements.lightbox) {
            this.elements.lightbox.style.display = 'flex';
            setTimeout(() => {
                this.elements.lightbox.style.opacity = '1';
            }, 10);
        }
        
        document.body.style.overflow = 'hidden';
        this.updateLightboxNavigation();
    }
    
    closeLightbox() {
        if (!this.elements.lightbox) return;
        
        console.log('❌ TouchGallery: Schließe Lightbox');
        
        this.elements.lightbox.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    showPreviousImage() {
        if (!this.currentImages || this.currentImages.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImages.length) % this.currentImages.length;
        this.updateLightboxImage();
        console.log('⬅️ TouchGallery: Vorheriges Bild:', this.currentImageIndex + 1);
    }
    
    showNextImage() {
        if (!this.currentImages || this.currentImages.length === 0) return;
        
        this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length;
        this.updateLightboxImage();
        console.log('➡️ TouchGallery: Nächstes Bild:', this.currentImageIndex + 1);
    }
    
    updateLightboxImage() {
        if (!this.elements.lightboxImage || !this.currentImages) return;
        
        const imageUrl = this.currentImages[this.currentImageIndex];
        
        this.elements.lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.lightboxImage.src = imageUrl;
            this.elements.lightboxImage.alt = `Bild ${this.currentImageIndex + 1}`;
            
            this.elements.lightboxImage.onload = () => {
                this.elements.lightboxImage.style.opacity = '1';
            };
            
            this.updateImageCounter();
        }, 150);
        
        this.updateLightboxNavigation();
    }
    
    updateImageCounter() {
        if (this.elements.imageCounter && this.currentImages) {
            this.elements.imageCounter.textContent = `${this.currentImageIndex + 1} / ${this.currentImages.length}`;
        }
    }
    
    updateLightboxNavigation() {
        const hasMultiple = this.currentImages && this.currentImages.length > 1;
        
        if (this.elements.lightboxPrev) {
            this.elements.lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
        }
        
        if (this.elements.lightboxNext) {
            this.elements.lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
        }
        
        this.updateImageCounter();
    }
    
    // TOUCH EVENTS
    handleTouchStart(e) {
        if (!e.touches || e.touches.length === 0) return;
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
    }
    
    handleTouchMove(e) {
        if (this.elements.lightbox && this.elements.lightbox.style.display === 'flex') {
            if (Math.abs(e.touches[0].clientX - this.touchStartX) > 30) {
                e.preventDefault();
            }
        }
    }
    
    handleTouchEnd(e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndTime = Date.now();
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaTime = touchEndTime - this.touchStartTime;
        const distance = Math.abs(deltaX);
        
        if (distance > this.swipeThreshold && deltaTime < 500) {
            this.handleSwipe(deltaX > 0 ? 'right' : 'left');
        }
    }
    
    handleSwipe(direction) {
        console.log('👆 TouchGallery: Swipe erkannt -', direction);
        
        this.showSwipeHint();
        
        if (this.elements.lightbox && this.elements.lightbox.style.display === 'flex') {
            if (direction === 'left') {
                this.showNextImage();
            } else if (direction === 'right') {
                this.showPreviousImage();
            }
        } else if (this.currentView === 'gallery') {
            if (direction === 'right') {
                this.showShootingsOverview();
            }
        }
    }
    
    handleKeyPress(e) {
        switch (e.key) {
            case 'Escape':
                if (this.elements.lightbox && this.elements.lightbox.style.display === 'flex') {
                    this.closeLightbox();
                } else if (this.currentView === 'gallery') {
                    this.showShootingsOverview();
                }
                break;
                
            case 'ArrowLeft':
                if (this.elements.lightbox && this.elements.lightbox.style.display === 'flex') {
                    this.showPreviousImage();
                }
                break;
                
            case 'ArrowRight':
                if (this.elements.lightbox && this.elements.lightbox.style.display === 'flex') {
                    this.showNextImage();
                }
                break;
                
            case 'F11':
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(console.error);
                } else {
                    document.exitFullscreen().catch(console.error);
                }
                break;
        }
    }
    
    handleResize() {
        console.log('📱 TouchGallery: Fenster-Größe geändert');
    }
    
    handleOrientationChange() {
        console.log('🔄 TouchGallery: Orientierung geändert');
        setTimeout(() => {
            if (this.currentView === 'gallery') {
                this.forceGalleryVisibility();
            }
        }, 500);
    }
    
    showLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'none';
        }
    }
    
    hideAllViews() {
        if (this.elements.shootingsOverview) {
            this.elements.shootingsOverview.style.display = 'none';
        }
        if (this.elements.shootingGallery) {
            this.elements.shootingGallery.style.display = 'none';
        }
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'none';
        }
    }
    
    showSwipeHint() {
        if (this.elements.swipeHint) {
            this.elements.swipeHint.style.opacity = '1';
            
            clearTimeout(this.swipeHintTimeout);
            this.swipeHintTimeout = setTimeout(() => {
                this.elements.swipeHint.style.opacity = '0';
            }, 2000);
        }
    }
    
    showError(message) {
        console.error('❌ TouchGallery Error:', message);
        
        this.hideAllViews();
        this.hideLoading();
        
        if (this.elements.errorText) {
            this.elements.errorText.textContent = message;
        }
        
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'block';
        }
    }
    
    debug() {
        return {
            currentView: this.currentView,
            currentShooting: this.currentShooting,
            currentImages: this.currentImages.length,
            currentImageIndex: this.currentImageIndex,
            isLoading: this.isLoading,
            shootingsCount: this.data?.shootings?.length || 0,
            elements: Object.keys(this.elements).length,
            version: '1.0.0-fixed-visibility'
        };
    }
}

// AUTO-INITIALISIERUNG
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TouchGallery: DOM Ready - starte Initialisierung in 200ms');
    
    setTimeout(() => {
        if (!window.touchGallery) {
            window.touchGallery = new TouchGallery();
        }
    }, 200);
});

// BRIDGE-FUNKTION für Kompatibilität
window.loadShooting = function(shootingName, displayName) {
    console.log('🎯 Bridge loadShooting:', shootingName);
    
    if (window.touchGallery && window.touchGallery.showShootingGallery) {
        window.touchGallery.showShootingGallery(shootingName);
    } else {
        console.log('⏳ TouchGallery noch nicht bereit, warte...');
        
        let attempts = 0;
        const waitInterval = setInterval(() => {
            attempts++;
            
            if (window.touchGallery && window.touchGallery.showShootingGallery) {
                clearInterval(waitInterval);
                console.log('✅ TouchGallery bereit nach', attempts, 'Versuchen');
                window.touchGallery.showShootingGallery(shootingName);
            } else if (attempts > 25) {
                clearInterval(waitInterval);
                console.error('❌ TouchGallery konnte nicht initialisiert werden');
                alert('Galerie konnte nicht geladen werden. Bitte Seite neu laden.');
            }
        }, 200);
    }
};

// GLOBAL HELPERS
window.touchGalleryHelpers = {
    refresh: () => location.reload(),
    fullscreen: () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    debug: () => window.touchGallery ? window.touchGallery.debug() : 'TouchGallery nicht initialisiert',
    forceVisible: () => {
        if (window.touchGallery) {
            window.touchGallery.forceGalleryVisibility();
        }
    }
};

console.log('🎯 TouchGallery Script geladen - bereit für 75" Portrait Display mit korrigierter Bild-Anzeige');