/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'uiComponent',
    'escaper',
    'mage/url',
    'Magento_Customer/js/customer-data',
    'jquery',
    'ko',
    'underscore',
    'sidebar',
    'mage/translate'
], function (Component, escaper,url,customerData,$,ko, _) {
    'use strict';
    var quoteItemData = window.checkoutConfig.quoteItemData;

    return Component.extend({
        defaults: {
            template: 'Magento_Checkout/summary/item/details'
            // allowedTags: ['b', 'strong', 'i', 'em', 'u']
        },
        quoteItemData: quoteItemData,
        getValue: function(quoteItem) {
            var itemId = elem.data('cart-item'),
            itemQty = elem.data('item-qty');
            return quoteItem.name;
        },

        getDataPost: function(itemId) {
            var itemsData = window.checkoutConfig.quoteItemData;
            var obj = {};
            var obj = {
                data: {}
            };

            itemsData.forEach(function (item) {
                if(item.item_id == itemId) { 
                    var mainlinkUrl = url.build('checkout/cart/delete/');
                    //var baseUrl = url.build('checkout/cart/');
                    var baseUrl = url.build('checkout/');                    
                    obj.action = mainlinkUrl;
                    obj.data.id= item.item_id;
                    obj.data.uenc = btoa(baseUrl);
                }
            });
            return JSON.stringify(obj);
        },

        getConfigUrl: function(itemId) { 
            var itemsData = window.checkoutConfig.quoteItemData;
            var configUrl = null;
            var mainlinkUrl = url.build('checkout/cart/configure');
            var linkUrl;
            itemsData.forEach(function (item) {
                var itm_id = item.item_id;
                var product_id = item.product.entity_id;
                if(item.item_id == itemId) { 
                    // linkUrl = mainlinkUrl+"/id/"+itm_id+"/product_id/"+product_id;
                    linkUrl = url.build('checkout/cart');
                }
            });
            if(linkUrl != null) {                
                jQuery('.details-qty-cstm .primary a').on('click',function(){
                    window.location = linkUrl;    
                });
                return linkUrl;
            }
            else {
                return '';
            }

        },

        getItemlead_time: function(quoteItem) {
            var itemProduct = this.getItemProduct(quoteItem.item_id);
            
            setTimeout(function () {
                var week  = jQuery('.cstm-product-lead-time span.product_lead_time').clone();
                var text_week  = jQuery('.cstm-product-lead-time span').clone();
                jQuery('.cstm-clone-lead-time-delivery').html(week); 
                jQuery('.cstm-clone-lead-time-summary').html(text_week); 
            }, 2000);
            return itemProduct.lead_time;
        },

        getItemProduct: function(item_id) {
            var itemElement = null;
            _.each(this.quoteItemData, function(element, index) {
                if (element.item_id == item_id) {
                    itemElement = element;
                }
            });
            return itemElement;
        },

        /**
         * @param {Object} quoteItem
         * @return {String}
         */
        getNameUnsanitizedHtml: function (quoteItem) {
            var txt = document.createElement('textarea');

            txt.innerHTML = quoteItem.name;

            return escaper.escapeHtml(txt.value, this.allowedTags);
        }

        /**
         * @param {Object} quoteItem
         * @return {String}Magento_Checkout/js/region-updater
         */
        // getValue: function (quoteItem) {
        //     return quoteItem.name;
        // }
    });
});
