define(
    [
        "uiComponent",
        'ko'
    ],
    function(
        Component,
        ko
    ) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Magento_Checkout/shipping-type-btn'
            },
            initialize: function () {
                this._super();
            }
        });
    }
);
