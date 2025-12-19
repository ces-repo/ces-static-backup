function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  
  jQuery(document).ready(function ($) {
    /* Create object */
    var tznCheckout = /*#__PURE__*/ (function () {
      function tznCheckout() {
        _classCallCheck(this, tznCheckout);
  
        _defineProperty(this, "previous_step", "");
  
        _defineProperty(this, "step", "your-information");
  
        _defineProperty(this, "step_text", "Your Information");
  
        _defineProperty(this, "fields", []);
  
        this.nextStepClick();
        this.breadcrumbsStepClick();
        this.editAddressClick();
        this.initAccordions();
      }
  
      _createClass(tznCheckout, [
        {
          key: "nextStepClick",
          value: function nextStepClick() {
            self = this;
            $("#main").on("click", ".btn-next-step", function (e) {
              e.preventDefault();
              var current_step = self.step,
                next_step = $(this).closest(".step").next(".step").attr("id"),
                next_step_text = $(
                  '.checkout-breadcrumbs a[data-step="' +
                    next_step +
                    '"] .step-name'
                ).text();
              self.step = next_step;
              self.previous_step = current_step;
              self.step_text = next_step_text;
              $("html, body").animate(
                {
                  scrollTop: $("#main").offset().top
                },
                900,
                "swing"
              );
              self.updateStep();
            });
          }
        },
        {
          key: "breadcrumbsStepClick",
          value: function breadcrumbsStepClick() {
            $(".checkout-breadcrumbs a").click(function (e) {
              e.preventDefault();
              var next_step = $(this).attr("data-step"),
                next_step_text = $(this).find(".step-name").text(),
                current_step = self.step;
              self.step = next_step;
              self.previous_step = current_step;
              self.step_text = next_step_text;
              self.updateStep();
            });
          }
        },
        {
          key: "editAddressClick",
          value: function editAddressClick() {
            $(".edit-address").click(function (e) {
              var address = $(this).data("address");
              var shipping_option = $('input[name="shipping_option"]');
              self.step = "your-information";
              self.previous_step = "payment";
              self.step_text = $(
                '.checkout-breadcrumbs a[data-step="' +
                  self.step +
                  '"] .step-name'
              ).text(); //update nav
  
              self.updateStep();
  
              if (address == "shipping") {
                if (!shipping_option.is(":checked")) {
                  $('input[name="shipping_option"]').click();
                }
  
                $("html, body").animate(
                  {
                    scrollTop: $(".shipping-options").offset().top - 30
                  },
                  900,
                  "swing"
                );
              }
            });
          }
        },
        {
          key: "updateStep",
          value: function updateStep() {
            self = this; //self.getFields();
  
            console.log(self.step);
  
            if (self.step !== "myaccount") {
              if (
                self.previous_step == "your-information" &&
                !self.validateFields()
              ) {
                return false;
              }
  
              if (self.step !== "your-information") {
                hide_login_msg();
              } else {
                $(".woocommerce-form-login-toggle .woocommerce-message").show();
              }
            } //needs fix in future
  
            if (self.step !== "your-information") {
              $(".btn-next-step").addClass("hidden");
            } else {
              $(".btn-next-step.hidden").removeClass("hidden");
            }
  
            populate_fields();
            $(".checkout-title h1").text(self.step_text);
            $('.checkout-breadcrumbs a[data-step="' + self.previous_step + '"]')
              .removeClass("current")
              .addClass("passed");
            $('.checkout-breadcrumbs a[data-step="' + self.step + '"]').addClass(
              "current"
            );
            $(".step").addClass("hidden");
            $(".step#" + self.step).removeClass("hidden");
          }
        },
        {
          key: "validateFields",
          value: function validateFields() {
            var validated = [];
            $(".validate-required .input-text:visible").each(function () {
              var id = $(this).attr("id");
  
              if ($(this).val().length < 1) {
                $(this)
                  .closest(".validate-required")
                  .addClass("field-not-validated");
                validated.push(false);
              } else {
                $(this)
                  .closest(".validate-required")
                  .removeClass("field-not-validated");
                $(this).closest(".validate-required").addClass("field-validated");
                validated.push(true);
              }
            });
  
            if (validated.includes(false)) {
              return false;
            } else {
              return true;
            }
  
            return true;
          }
        },
        {
          key: "initAccordions",
          value: function initAccordions() {
            $(".coupon-code-wrapper .coupon").accordion({
              header: ".widget-title",
              heightStyle: "content",
              collapsible: true,
              active: false
            });
          }
        }
      ]);
  
      return tznCheckout;
    })();
  
    TZNCheckout = new tznCheckout();
  
    function hide_login_msg() {
      $(
        ".woocommerce-form-login-toggle .woocommerce-message, .woocommerce-form-login"
      ).hide();
    }
  
    function billing_title_check() {
      $('#billing_title_field input[type="radio"]:first-child').prop(
        "checked",
        true
      );
    }
  
    billing_title_check();
  
    function hide_vat_not_germany() {
      if ($("#billing_country").find(":selected").val() === "DE") {
        $("#woocommerce_eu_vat_number_field").addClass("hidden");
      } else {
        $("#woocommerce_eu_vat_number_field").removeClass("hidden");
      }
  
      $("#billing_country").on("change", function (event) {
        if ($(this).find(":selected").val() === "DE") {
          $("#woocommerce_eu_vat_number_field").addClass("hidden");
        } else {
          $("#woocommerce_eu_vat_number_field").removeClass("hidden");
        }
      });
    }
  
    hide_vat_not_germany();
  
    function ship_different_address() {
      $(".shipping-option label input").click(function () {
        if ($(this).is(":checked")) {
          $("#shipping").removeClass("hidden");
          $(".shipping_address").show(); //IMPORTANT: This must be checked otherwise shipping fields are populated from billing
  
          $("#ship-to-different-address-checkbox").prop("checked", true);
        } else {
          $("#shipping").addClass("hidden");
        }
      });
    }
  
    ship_different_address();
  
    function populate_fields() {
      var shipping_option = $('input[name="shipping_option"]');
  
      if (!shipping_option.is(":checked")) {
        //fill shipping fields values, using billing fields
        $("#billing input, #billing select option:selected").each(function () {
          var input_val = $(this).val(); //select
  
          if ($(this).parent("select").length) {
            var input_val = $(this).text();
            var field_name = $(this).closest("select").attr("name"),
              clean_name = field_name.split(/_(.+)/)[1];
            $(
              '#shipping select[name="shipping_' +
                clean_name +
                '"] > option[value="' +
                input_val +
                '"]'
            ).prop("selected", true); //fill text in payment
          } else if ($(this).is(":radio")) {
            if ($(this).is(":checked")) {
              var input_val = $(this).next("label").text();
              var field_name = $(this).attr("name"),
                clean_name = field_name.split(/_(.+)/)[1];
            }
          } else {
            var field_name = $(this).attr("name"),
              clean_name = field_name.split(/_(.+)/)[1]; //input
  
            $('#shipping input[name="shipping_' + clean_name + '"]').val(
              input_val
            ); //fill text in payment
          }
  
          $(
            ".addresses .shipping-address .shipping_" +
              clean_name +
              ", .addresses .billing-address .billing_" +
              clean_name +
              ""
          ).text(input_val);
        }); //default - fill fields
      } else {
        $(
          "#your-information .option input, #your-information .option select option:selected"
        ).each(function () {
          var input_val = $(this).val();
  
          if ($(this).parent("select").length) {
            var input_val = $(this).text();
            var field_name = $(this).parent().attr("name");
          } else if ($(this).is(":radio")) {
            if ($(this).is(":checked")) {
              var input_val = $(this).next("label").text();
              var field_name = $(this).attr("name"),
                clean_name = field_name.split(/_(.+)/)[1];
            }
          } else {
            var field_name = $(this).attr("name");
          }
  
          $(".addresses ." + field_name).text(input_val);
        });
      }
    }
  
    $(".showlogin").addClass("button is-outline"); //stripe button
  
    $(window).on("load", function () {
      $("#your-information #wc-stripe-payment-request-button").insertAfter(
        "#payment .wc-gzd-order-submit"
      );
      $("#shipping_dhl_address_type_field").prependTo(".shipping_address"); //dhl plugin for packetstation button - show/hide
  
      $("#dhl_parcel_finder").hide();
    }); //dhl plugin for packetstation button - show/hide
  
    $("#shipping_dhl_postnum_field").addClass("validate-required");
    $("#shipping_dhl_address_type_field select").on("change", function () {
      if (this.value.includes("dhl")) {
        $("#dhl_parcel_finder").show();
      } else {
        $("#dhl_parcel_finder").hide();
      }
    }); //?wc-ajax=checkout
  
    $(document).on("updated_checkout", function () {});
    $(document).on(
      "keyup",
      ".order-review #wc_checkout_add_ons input",
      function () {
        var text_val = $(this).val(),
          field_id = $(this).attr("id");
        $("#your-information #wc_checkout_add_ons input#" + field_id).val(
          text_val
        );
      }
    );
  });
  