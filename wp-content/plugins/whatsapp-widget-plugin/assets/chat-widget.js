/* ============================================
   CES Webchat Widget
   ============================================ */
(function() {
    'use strict';

    // Konfiguration (von WordPress oder Defaults)
    var wpConfig = window.cesChatConfig || {};
    var CONFIG = {
        webhookUrl: wpConfig.webhookUrl || 'https://mitarbeit.catering-miete.ch/webhook.php',
        pollUrl: wpConfig.pollUrl || 'https://mitarbeit.catering-miete.ch/check_messages.php',
        phoneNumber: wpConfig.phoneNumber || '41447307071',
        pollInterval: 5000,
        pollIntervalBackground: 30000,
        maxRetries: 3
    };

    // State
    var userId = localStorage.getItem('webchat_user_id');
    if (!userId) {
        userId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('webchat_user_id', userId);
    }

    var chatHistory = JSON.parse(localStorage.getItem('webchat_history') || '[]');
    var lastCheckTime = Math.floor(Date.now() / 1000) - 3600;
    var pollingTimer = null;
    var isOpen = false;
    var shownMessageIds = new Set();
    var isSending = false;

    // ============================================
    // UI erstellen
    // ============================================
    function createChatUI() {
        // Chat-Bubble
        var bubble = document.createElement('button');
        bubble.id = 'ces-chat-bubble';
        bubble.setAttribute('aria-label', 'Chat öffnen');
        bubble.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>' +
            '<span class="unread-badge" id="ces-unread">0</span>';
        bubble.addEventListener('click', toggleChat);

        // Chat-Fenster
        var chatWindow = document.createElement('div');
        chatWindow.id = 'ces-chat-window';
        chatWindow.innerHTML =
            '<div id="ces-chat-header">' +
                '<div class="header-left">' +
                    '<div class="header-avatar">\uD83C\uDF7D\uFE0F</div>' +
                    '<div class="header-info">' +
                        '<h4>CES Catering Chat</h4>' +
                        '<span>Wir antworten sofort</span>' +
                    '</div>' +
                '</div>' +
                '<div class="header-actions">' +
                    '<a href="https://wa.me/' + CONFIG.phoneNumber + '" target="_blank" rel="noopener" title="Via WhatsApp schreiben">' +
                        '<svg viewBox="0 0 24 24" width="18" height="18" fill="white">' +
                            '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>' +
                            '<path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.467A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.6-5.922-1.638l-.425-.253-2.74.87.882-2.678-.278-.44A9.77 9.77 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>' +
                        '</svg>' +
                    '</a>' +
                    '<button id="ces-chat-close" title="Chat schliessen">\u2715</button>' +
                '</div>' +
            '</div>' +
            '<div id="ces-connection-status"></div>' +
            '<div id="ces-chat-messages"></div>' +
            '<div class="ces-typing" id="ces-typing">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
            '<div id="ces-chat-input-area">' +
                '<input type="text" id="ces-chat-input" placeholder="Ihre Nachricht..." autocomplete="off">' +
                '<button id="ces-chat-send" title="Senden">' +
                    '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
                '</button>' +
            '</div>' +
            '<div id="ces-chat-wa-link">' +
                '<a href="https://wa.me/' + CONFIG.phoneNumber + '" target="_blank" rel="noopener">' +
                    '\uD83D\uDCF1 Lieber via WhatsApp schreiben?' +
                '</a>' +
            '</div>';

        document.body.appendChild(bubble);
        document.body.appendChild(chatWindow);

        // Event Listeners
        document.getElementById('ces-chat-close').addEventListener('click', toggleChat);
        document.getElementById('ces-chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !isSending) sendMessage();
        });
        document.getElementById('ces-chat-send').addEventListener('click', function() {
            if (!isSending) sendMessage();
        });

        // Polling bei Sichtbarkeit anpassen
        document.addEventListener('visibilitychange', function() {
            if (pollingTimer) clearInterval(pollingTimer);
            if (isOpen) {
                var interval = document.hidden ? CONFIG.pollIntervalBackground : CONFIG.pollInterval;
                pollingTimer = setInterval(checkNewMessages, interval);
                if (!document.hidden) checkNewMessages();
            }
        });

        // Chat-History laden
        renderMessages();
    }

    // ============================================
    // Chat öffnen/schliessen
    // ============================================
    function toggleChat() {
        var chatWindow = document.getElementById('ces-chat-window');
        var bubble = document.getElementById('ces-chat-bubble');

        if (isOpen) {
            // Schliessen
            chatWindow.classList.add('closing');
            setTimeout(function() {
                chatWindow.classList.remove('open', 'closing');
                bubble.classList.remove('hidden');
            }, 250);
            isOpen = false;

            // Polling stoppen
            if (pollingTimer) {
                clearInterval(pollingTimer);
                pollingTimer = null;
            }
        } else {
            // Öffnen
            chatWindow.classList.add('open');
            chatWindow.classList.remove('closing');
            bubble.classList.add('hidden');
            isOpen = true;

            // Fokus auf Input
            setTimeout(function() {
                document.getElementById('ces-chat-input').focus();
                scrollToBottom();
            }, 300);

            // Unread Badge zurücksetzen
            var badge = document.getElementById('ces-unread');
            badge.style.display = 'none';
            badge.textContent = '0';

            // Polling starten
            checkNewMessages();
            pollingTimer = setInterval(checkNewMessages, CONFIG.pollInterval);
        }
    }

    // ============================================
    // Nachrichten rendern
    // ============================================
    function renderMessages() {
        var container = document.getElementById('ces-chat-messages');
        if (!container) return;
        container.innerHTML = '';

        // Willkommen
        var welcome = document.createElement('div');
        welcome.className = 'ces-welcome';
        welcome.innerHTML = 'Hallo und willkommen bei CES Catering! 🍽️ Ich bin die KI-Assistenz und helfe Ihnen gerne weiter – auch wenn ich nicht immer alles perfekt weiss 😊<br><br>Tippen Sie einfach <strong>«Mensch»</strong>, um mit unserem Team zu sprechen. Falls es mal etwas dauert, erreichen Sie uns auch unter <a href="tel:+41447307070">044 730 70 70</a> oder <a href="mailto:anfrage@catering-miete.ch">anfrage@catering-miete.ch</a>';
        container.appendChild(welcome);

        // History
        chatHistory.forEach(function(msg) {
            appendMessage(msg.sender === 'user' ? 'user' : 'bot', msg.text, false);
        });

        scrollToBottom();
    }

	function linkifyText(text) {
        // Erst HTML-Entities escapen (XSS-Schutz)
        var escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        // Dann URLs in klickbare Links umwandeln
        return escaped.replace(
            /(https?:\/\/[^\s<>"']+)/g,
            '<a href="$1" target="_blank" rel="noopener" style="color:#1a73e8;text-decoration:underline;word-break:break-all;">$1</a>'
        );
    }
	
    function appendMessage(type, text, save) {
        var container = document.getElementById('ces-chat-messages');
        if (!container) return null;

        var div = document.createElement('div');

        if (type === 'user') {
            div.className = 'ces-msg ces-msg-user';
        } else if (type === 'error') {
            div.className = 'ces-msg ces-msg-error';
        } else {
            div.className = 'ces-msg ces-msg-bot';
        }

        // Text mit klickbaren Links (XSS-sicher) 
        div.innerHTML = linkifyText(text);

        // Zeitstempel
        if (type !== 'error') {
            var time = document.createElement('div');
            time.className = 'ces-msg-time';
            time.textContent = new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
            div.appendChild(time);
        }

        container.appendChild(div);
        scrollToBottom();

        // In History speichern
        if (save !== false) {
            chatHistory.push({
                sender: type === 'user' ? 'user' : 'system',
                text: text
            });
            localStorage.setItem('webchat_history', JSON.stringify(chatHistory));
        }

        return div;
    }

    function scrollToBottom() {
        var container = document.getElementById('ces-chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // ============================================
    // Nachricht senden
    // ============================================
    function sendMessage() {
        var input = document.getElementById('ces-chat-input');
        var message = input.value.trim();
        if (!message || isSending) return;

        isSending = true;
        input.value = '';

        // User-Nachricht anzeigen
        appendMessage('user', message);

        // Typing-Indicator zeigen
        showTyping(true);

        // Senden-Button deaktivieren
        document.getElementById('ces-chat-send').disabled = true;

        // An Server senden
        sendToServer(message, 0);
    }

    function sendToServer(message, retryCount) {
        fetch(CONFIG.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'webchat',
                sender: userId,
                message: message,
                order_id: getOrderId()
            })
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Netzwerkfehler');
            return response.json();
        })
        .then(function(data) {
            showTyping(false);
            document.getElementById('ces-chat-send').disabled = false;
            isSending = false;

            if (data.auto_reply) {
                appendMessage('bot', data.auto_reply);
                // Polling-Zeit aktualisieren (verhindert Duplikate)
                lastCheckTime = Math.floor(Date.now() / 1000);
            }

            updateConnectionStatus(true);
        })
        .catch(function(error) {
            console.error('CES Chat Sendefehler:', error);

            if (retryCount < CONFIG.maxRetries) {
                setTimeout(function() {
                    sendToServer(message, retryCount + 1);
                }, 2000);
            } else {
                showTyping(false);
                document.getElementById('ces-chat-send').disabled = false;
                isSending = false;
                appendMessage('error', 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
                updateConnectionStatus(false);
            }
        });
    }

    // ============================================
    // Polling für Mitarbeiter-Nachrichten
    // ============================================
    function checkNewMessages() {
        fetch(CONFIG.pollUrl + '?user=' + encodeURIComponent(userId) + '&last_check=' + lastCheckTime, {
            credentials: 'include',
            mode: 'cors'
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Netzwerkfehler');
            return response.json();
        })
        .then(function(data) {
            updateConnectionStatus(true);

            if (data.messages && data.messages.length > 0) {
                var newCount = 0;

                data.messages.forEach(function(msg) {
                    // Duplikat-Check: ID
                    if (shownMessageIds.has(msg.id)) return;
                    shownMessageIds.add(msg.id);

                    // Duplikat-Check: Inhalt
                    var isDuplicate = chatHistory.some(function(h) {
                        return h.sender === 'system' && h.text === msg.content;
                    });
                    if (isDuplicate) return;

                    appendMessage('bot', msg.content);
                    newCount++;
                });

                // Unread Badge (wenn Chat geschlossen)
                if (!isOpen && newCount > 0) {
                    var badge = document.getElementById('ces-unread');
                    var current = parseInt(badge.textContent) || 0;
                    badge.textContent = current + newCount;
                    badge.style.display = 'flex';
                }
            }

            // Typing Indicator von Mitarbeiter
            if (data.is_typing) {
                showTyping(true);
            }

            if (data.server_time) {
                lastCheckTime = data.server_time;
            }
        })
        .catch(function(error) {
            console.error('CES Chat Polling-Fehler:', error);
            updateConnectionStatus(false);
        });
    }

    // ============================================
    // Hilfsfunktionen
    // ============================================
    function showTyping(active) {
        var typing = document.getElementById('ces-typing');
        if (typing) {
            typing.classList.toggle('active', active);
            if (active) scrollToBottom();
        }
    }

    function updateConnectionStatus(connected) {
        var el = document.getElementById('ces-connection-status');
        if (!el) return;

        if (connected) {
            if (el.classList.contains('offline')) {
                el.className = '';
                el.id = 'ces-connection-status';
                el.classList.add('reconnected');
                el.textContent = 'Verbindung wiederhergestellt';
                setTimeout(function() {
                    el.className = '';
                    el.id = 'ces-connection-status';
                    el.textContent = '';
                }, 3000);
            }
        } else {
            el.className = '';
            el.id = 'ces-connection-status';
            el.classList.add('offline');
            el.textContent = 'Verbindungsprobleme...';
        }
    }

    function getOrderId() {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get('order_id') || null;
        } catch(e) {
            return null;
        }
    }

    // ============================================
    // Chat-History löschen (für Debug/User)
    // ============================================
    window.cesClearChat = function() {
        chatHistory = [];
        shownMessageIds.clear();
        localStorage.removeItem('webchat_history');
        renderMessages();
    };

    // ============================================
    // Initialisierung
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatUI);
    } else {
        createChatUI();
    }

})();
