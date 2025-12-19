import metadata from './block.json';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback, useDispatch } from '@wordpress/element';
import { WtScBlocksGiftCouponForm } from './form.tsx';

// Global import
const { registerCheckoutBlock } = wc.blocksCheckout;

setTimeout(function(){
    let targetElm = document.getElementById('payment-method') ? document.getElementById('payment-method') : document.getElementById('shipping-option');
    targetElm = targetElm ? targetElm : document.getElementById('shipping-fields');
    targetElm = targetElm ? targetElm : document.getElementById('contact-fields');
    if( targetElm && document.getElementById('wt-sc-gift-coupon-block') ){
        targetElm.after(document.getElementById('wt-sc-gift-coupon-block'));
    } 
}, 100);


const Block = ({ children, checkoutExtensionData }) => {
    
    const [ giftCoupon, setGiftCoupon ] = useState('');
    const [ attributes, setAttributes ] = useState({'wt_coupon_to_do':'wt_send_to_me', 'wt_coupon_send_to': '', 'wt_coupon_send_to_message': ''});
    const { setExtensionData } = checkoutExtensionData;

    useEffect( () => {
        setExtensionData( 'wt_sc_blocks', 'wt_coupon_to_do', attributes.wt_coupon_to_do );
        setExtensionData( 'wt_sc_blocks', 'wt_coupon_send_to', attributes.wt_coupon_send_to );
        setExtensionData( 'wt_sc_blocks', 'wt_coupon_send_to_message', attributes.wt_coupon_send_to_message );

    }, [attributes] );

    return ("1" === wc_checkout_params.show_gift_coupon_form ? 
        ( <fieldset className={ 'wt-sc-gift-coupon-block wc-block-components-checkout-step wc-block-components-checkout-step--with-step-number' } id={ 'wt-sc-gift-coupon-block' }>          
            <WtScBlocksGiftCouponForm attributes={ attributes } setAttributes={ setAttributes } />
        </fieldset> ) : ''
    )
}


const options = {
    metadata,
    component: Block
};


registerCheckoutBlock( options );