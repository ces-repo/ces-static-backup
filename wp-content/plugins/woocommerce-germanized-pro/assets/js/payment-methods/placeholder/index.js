/**
 * External dependencies
 */
import { registerPaymentMethod } from '@woocommerce/blocks-registry';
import { decodeEntities } from '@wordpress/html-entities';
import { getSetting } from '@woocommerce/settings';

const paymentMethods = getSetting( 'paymentMethodData', {} );

Object.entries( paymentMethods ).forEach( ( [ methodName, method ] ) => {
    if ( 'placeholder_' !== methodName.slice( 0, 12 ) ) {
        return;
    }

    const label = decodeEntities( method?.title || '' );

    /**
     * Content component
     */
    const Content = () => {
        return decodeEntities( method.description || '' );
    };

    /**
     * Label component
     *
     * @param {*} props Props from payment API.
     */
    const Label = ( props ) => {
        const { PaymentMethodLabel } = props.components;
        return <PaymentMethodLabel text={ label } />;
    };

    const PlaceholderMethod = {
        name: methodName,
        label: <Label />,
        content: <Content />,
        edit: <Content />,
        canMakePayment: () => true,
        ariaLabel: label,
        supports: {
            features: method?.supports ?? [],
        },
    };

    registerPaymentMethod( PlaceholderMethod );
} );
