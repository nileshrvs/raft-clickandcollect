/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'rjsResolver'
], function (resolver) {
    'use strict';

    /**
     * Removes provided loader element from DOM.
     *
     * @param {HTMLElement} $loader - Loader DOM element.
     */
    function hideLoader($loader) {
        $loader.parentNode.removeChild($loader);
        // custom code for loading payment method if URL has #payment
        if(window.location.hash == "#payment"){
            setTimeout(function(){
                jQuery('.button.action.continue.primary').trigger('click');
                document.body.scrollTop = document.documentElement.scrollTop = jQuery("#shipping-type-buttons-cstm").offset().top;
            },1000);
        }
        // custom code END
    }

    /**
     * Initializes assets loading process listener.
     *
     * @param {Object} config - Optional configuration
     * @param {HTMLElement} $loader - Loader DOM element.
     */
    function init(config, $loader) {
        resolver(hideLoader.bind(null, $loader));
    }

    return init;
});
