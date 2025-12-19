/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/store-credit/block.json":
/*!*************************************!*\
  !*** ./src/store-credit/block.json ***!
  \*************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":2,"name":"wt-sc-blocks/store-credit","version":"1.0.0","title":"Store credit","category":"woocommerce","keywords":["Store credit","WooCommerce"],"icon":"","description":"Store credit related operations.","parent":["woocommerce/cart-items-block"],"attributes":{"lock":{"type":"object","default":{"remove":true,"move":true}}},"textdomain":"wt-smart-coupons-for-woocommerce"}');

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
/*!**************************************!*\
  !*** ./src/store-credit/frontend.js ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./block.json */ "./src/store-credit/block.json");


// Global import
const {
  registerCheckoutFilters
} = window.wc.blocksCheckout;
const updateCartItemImage = (defaultValue, extensions, args) => {
  const cartitem_giftcard_image = args?.cart?.extensions?.wt_sc_blocks?.cartitem_giftcard_image;
  const cart_item_key = args?.cartItem?.key;
  if (cart_item_key && cartitem_giftcard_image && cartitem_giftcard_image[cart_item_key]) {
    if (args.cartItem.images.length) {
      args.cartItem.images[0].src = cartitem_giftcard_image[cart_item_key];
      args.cartItem.images[0].thumbnail = cartitem_giftcard_image[cart_item_key];
    } else {
      args.cartItem.images = [{
        'id': 0,
        'src': cartitem_giftcard_image[cart_item_key],
        'thumbnail': cartitem_giftcard_image[cart_item_key],
        'srcset': '',
        'sizes': '',
        'name': '',
        'alt': ''
      }];
    }
  }
  return defaultValue;
};
registerCheckoutFilters('wt-sc-blocks-update-cart-item-image', {
  itemName: updateCartItemImage
});
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map