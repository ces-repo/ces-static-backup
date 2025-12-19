/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/gift-coupon/form.tsx":
/*!**********************************!*\
  !*** ./src/gift-coupon/form.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WtScBlocksGiftCouponForm: () => (/* binding */ WtScBlocksGiftCouponForm)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _woocommerce_blocks_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @woocommerce/blocks-components */ "@woocommerce/blocks-components");
/* harmony import */ var _woocommerce_blocks_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_woocommerce_blocks_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @woocommerce/blocks-checkout */ "@woocommerce/blocks-checkout");
/* harmony import */ var _woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_5__);







const WtScBlocksGiftCouponForm = ({
  attributes,
  setAttributes
}) => {
  /* Declare field values */
  const [giftSend, setGiftSend] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('wt_send_to_me');
  const [giftSendEmail, setGiftSendEmail] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [giftSendMsg, setGiftSendMsg] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');

  /* Set Gift send option */
  const onGiftSendChange = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(value => {
    setGiftSend(value);
    setAttributes({
      ...attributes,
      wt_coupon_to_do: value
    });
    if ('gift_to_a_friend' === value) {
      setTimeout(function () {
        document.getElementById('wt_coupon_send_to_message').classList.add('wc-block-components-textarea');
      }, 200);
    }
  }, [setGiftSend, setAttributes, attributes]);

  /* Set Gift email */
  const onGiftSendEmailChange = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(value => {
    setGiftSendEmail(value);
    setAttributes({
      ...attributes,
      wt_coupon_send_to: value
    });
  }, [setGiftSendEmail, setAttributes, attributes]);

  /* Set Gift message */
  const onGiftSendMsgChange = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(value => {
    setGiftSendMsg(value);
    setAttributes({
      ...attributes,
      wt_coupon_send_to_message: value
    });
  }, [setGiftSendMsg, setAttributes, attributes]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'wt_smart_coupon_send_coupon_wrap'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("legend", {
    className: "screen-reader-text"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Congrats! Unlocked gift coupon(s) with your order!', 'wt-smart-coupons-for-woocommerce-pro')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wc-block-components-checkout-step__heading"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "wc-block-components-title wc-block-components-checkout-step__title"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Congrats! Unlocked gift coupon(s) with your order!', 'wt-smart-coupons-for-woocommerce-pro'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'wc-block-components-checkout-step__container'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'wc-block-components-checkout-step__content'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Claim your coupon(s) now!', 'wt-smart-coupons-for-woocommerce-pro')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_woocommerce_blocks_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
    selected: giftSend,
    options: [{
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Send to me', 'wt-smart-coupons-for-woocommerce-pro'),
      value: 'wt_send_to_me'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Gift to a friend', 'wt-smart-coupons-for-woocommerce-pro'),
      value: 'gift_to_a_friend'
    }],
    onChange: onGiftSendChange
  }), 'gift_to_a_friend' === giftSend && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'gift_to_friend_form'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'wt-form-item'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_5__.ValidatedTextInput, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Coupon recipient email', 'wt-smart-coupons-for-woocommerce-pro'),
    type: 'email',
    name: 'wt_coupon_send_to',
    id: 'wt_coupon_send_to',
    value: giftSendEmail,
    onChange: onGiftSendEmailChange
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: 'wt-form-item'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextareaControl, {
    placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Message', 'wt-smart-coupons-for-woocommerce-pro'),
    name: 'wt_coupon_send_to_message',
    id: 'wt_coupon_send_to_message',
    value: giftSendMsg,
    onChange: onGiftSendMsgChange
  }))))));
};

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "@woocommerce/blocks-checkout":
/*!****************************************!*\
  !*** external ["wc","blocksCheckout"] ***!
  \****************************************/
/***/ ((module) => {

module.exports = window["wc"]["blocksCheckout"];

/***/ }),

/***/ "@woocommerce/blocks-components":
/*!******************************************!*\
  !*** external ["wc","blocksComponents"] ***!
  \******************************************/
/***/ ((module) => {

module.exports = window["wc"]["blocksComponents"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./src/gift-coupon/block.json":
/*!************************************!*\
  !*** ./src/gift-coupon/block.json ***!
  \************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":2,"name":"wt-sc-blocks/gift-coupon","version":"1.0.0","title":"Gift Coupon form","category":"woocommerce","parent":["woocommerce/checkout-fields-block"],"attributes":{"lock":{"type":"object","default":{"remove":true,"move":true}}},"textdomain":"wt-smart-coupons-for-woocommerce-pro","editorScript":"file:./index.js","editorStyle":"file:./index.css"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************************!*\
  !*** ./src/gift-coupon/frontend.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block.json */ "./src/gift-coupon/block.json");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _form_tsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./form.tsx */ "./src/gift-coupon/form.tsx");






// Global import
const {
  registerCheckoutBlock
} = wc.blocksCheckout;
setTimeout(function () {
  let targetElm = document.getElementById('payment-method') ? document.getElementById('payment-method') : document.getElementById('shipping-option');
  targetElm = targetElm ? targetElm : document.getElementById('shipping-fields');
  targetElm = targetElm ? targetElm : document.getElementById('contact-fields');
  if (targetElm && document.getElementById('wt-sc-gift-coupon-block')) {
    targetElm.after(document.getElementById('wt-sc-gift-coupon-block'));
  }
}, 100);
const Block = ({
  children,
  checkoutExtensionData
}) => {
  const [giftCoupon, setGiftCoupon] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)('');
  const [attributes, setAttributes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)({
    'wt_coupon_to_do': 'wt_send_to_me',
    'wt_coupon_send_to': '',
    'wt_coupon_send_to_message': ''
  });
  const {
    setExtensionData
  } = checkoutExtensionData;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    setExtensionData('wt_sc_blocks', 'wt_coupon_to_do', attributes.wt_coupon_to_do);
    setExtensionData('wt_sc_blocks', 'wt_coupon_send_to', attributes.wt_coupon_send_to);
    setExtensionData('wt_sc_blocks', 'wt_coupon_send_to_message', attributes.wt_coupon_send_to_message);
  }, [attributes]);
  return "1" === wc_checkout_params.show_gift_coupon_form ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("fieldset", {
    className: 'wt-sc-gift-coupon-block wc-block-components-checkout-step wc-block-components-checkout-step--with-step-number',
    id: 'wt-sc-gift-coupon-block'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_form_tsx__WEBPACK_IMPORTED_MODULE_4__.WtScBlocksGiftCouponForm, {
    attributes: attributes,
    setAttributes: setAttributes
  })) : '';
};
const options = {
  metadata: _block_json__WEBPACK_IMPORTED_MODULE_1__,
  component: Block
};
registerCheckoutBlock(options);
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map