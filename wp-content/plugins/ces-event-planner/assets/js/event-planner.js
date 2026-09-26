/* CES Event Planner — Wizard Navigation */
(function($) {
    'use strict';

    $(document).ready(function() {
        var $form = $('#ces-ep-form');
        if ($form.length === 0) return;

        var $steps = $form.find('.ces-ep-step');
        var totalSteps = $steps.length;
        var currentStep = 1;

        var $back = $('#ces-ep-back');
        var $next = $('#ces-ep-next');
        var $submit = $('#ces-ep-submit');
        var $progressBar = $form.find('.ces-ep-progress-bar');
        var $stepLabel = $form.find('.ces-ep-step-label');

        var lang = $form.closest('.ces-ep-wrap').data('lang') || 'de';
        var t = function(de, en) { return lang === 'en' ? en : de; };

        function showStep(n) {
            currentStep = Math.max(1, Math.min(totalSteps, n));
            $steps.removeClass('ces-ep-step-active');
            $steps.filter('[data-step="' + currentStep + '"]').addClass('ces-ep-step-active');

            // Progress
            var pct = (currentStep / totalSteps) * 100;
            $progressBar.css('width', pct + '%');
            $stepLabel.text(t('Schritt ' + currentStep + ' von ' + totalSteps,
                              'Step ' + currentStep + ' of ' + totalSteps));

            // Buttons
            $back.prop('disabled', currentStep === 1);
            if (currentStep === totalSteps) {
                $next.hide();
                $submit.show();
                renderSummary();
            } else {
                $next.show();
                $submit.hide();
            }

            // Kein Auto-Scroll — stört mit sticky header mehr als es hilft.
            // User scrollt bei Bedarf selbst.
        }

        function isStepComplete(stepNum) {
            // Silent check — no alert, no UI changes.
            var $step = $steps.filter('[data-step="' + stepNum + '"]');
            var valid = true;
            $step.find('input[required], textarea[required], select[required]').each(function() {
                var $el = $(this);
                if ($el.attr('type') === 'radio') {
                    var name = $el.attr('name');
                    if ($step.find('input[name="' + name + '"]:checked').length === 0) valid = false;
                } else if (!$el.val()) {
                    valid = false;
                }
            });
            return valid;
        }

        function validateCurrentStep() {
            // Called on explicit "Next" click — shows alert if incomplete.
            var $step = $steps.filter('[data-step="' + currentStep + '"]');
            var valid = true;
            $step.find('input[required], textarea[required], select[required]').each(function() {
                var $el = $(this);
                if ($el.attr('type') === 'radio') {
                    var name = $el.attr('name');
                    if ($step.find('input[name="' + name + '"]:checked').length === 0) valid = false;
                } else if (!$el.val()) {
                    valid = false;
                    $el.addClass('ces-ep-invalid');
                } else {
                    $el.removeClass('ces-ep-invalid');
                }
            });

            if (!valid) {
                alert(t('Bitte fülle alle Felder in diesem Schritt aus.',
                        'Please fill all fields in this step.'));
            }
            return valid;
        }

        function renderSummary() {
            var $summary = $('#ces-ep-summary');
            $summary.empty();

            var rows = [
                { label: t('Anlass', 'Event'),     selector: 'input[name="event_type"]:checked', labelSelector: true },
                { label: t('Datum', 'Date'),       selector: 'input[name="event_date"]',         labelSelector: false },
                { label: t('Gäste', 'Guests'),     selector: 'input[name="guest_count"]',        labelSelector: false },
                { label: t('Stil', 'Style'),       selector: 'input[name="style"]:checked',      labelSelector: true },
                { label: t('Venue', 'Venue'),      selector: 'input[name="venue_type"]:checked', labelSelector: true },
                { label: t('Farben', 'Colors'),    selector: 'input[name="color_scheme"]:checked', labelSelector: true }
            ];

            rows.forEach(function(r) {
                var $input = $form.find(r.selector);
                if (!$input.length) return;

                var value = '';
                if (r.labelSelector) {
                    // Radio: grab the visible label text
                    var $opt = $input.closest('.ces-ep-option');
                    value = $opt.find('.ces-ep-option-label').text().trim();
                } else {
                    value = $input.val();
                }

                if (value) {
                    $summary.append(
                        '<div class="ces-ep-summary-row">' +
                        '<span class="ces-ep-summary-label">' + r.label + '</span>' +
                        '<span class="ces-ep-summary-value">' + $('<div>').text(value).html() + '</span>' +
                        '</div>'
                    );
                }
            });
        }

        // Navigation
        $next.on('click', function() {
            if (validateCurrentStep()) showStep(currentStep + 1);
        });
        $back.on('click', function() {
            showStep(currentStep - 1);
        });

        // Quick-pick chips
        $form.on('click', '.ces-ep-chip', function() {
            var $chip = $(this);
            var targetId = $chip.data('target');
            var value = $chip.data('value');
            $('#' + targetId).val(value);
        });

        // Auto-advance when radio picked — SILENT: only advances if everything in step is complete,
        // otherwise just stays on step (no alert, no validation errors).
        $form.on('change', 'input[type="radio"]', function() {
            var $step = $(this).closest('.ces-ep-step');
            var stepNum = parseInt($step.data('step'), 10);
            if (stepNum !== currentStep) return;
            if (stepNum === totalSteps) return;
            setTimeout(function() {
                if (isStepComplete(currentStep)) showStep(currentStep + 1);
            }, 400);
        });

        // Init
        showStep(1);
    });

})(jQuery);
