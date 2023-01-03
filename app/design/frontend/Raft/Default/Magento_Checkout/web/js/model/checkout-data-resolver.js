/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * Checkout adapter for customer data storage
 */
 define([
    'Magento_Customer/js/model/address-list',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/create-shipping-address',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/action/select-shipping-method',
    'Magento_Checkout/js/model/payment-service',
    'Magento_Checkout/js/action/select-payment-method',
    'Magento_Checkout/js/model/address-converter',
    'Magento_Checkout/js/action/select-billing-address',
    'Magento_Checkout/js/action/create-billing-address',
    'underscore'
], function (
    addressList,
    quote,
    checkoutData,
    createShippingAddress,
    selectShippingAddress,
    selectShippingMethodAction,
    paymentService,
    selectPaymentMethodAction,
    addressConverter,
    selectBillingAddress,
    createBillingAddress,
    _
) {
    'use strict';

    return {

        /**
         * Resolve estimation address. Used local storage
         */
        resolveEstimationAddress: function () {
            
            var address;

            if (checkoutData.getShippingAddressFromData()) {
                address = addressConverter.formAddressDataToQuoteAddress(checkoutData.getShippingAddressFromData());
                selectShippingAddress(address);
            } else {
                this.resolveShippingAddress();
            }

            if (quote.isVirtual()) {
                if (checkoutData.getBillingAddressFromData()) {
                    address = addressConverter.formAddressDataToQuoteAddress(
                        checkoutData.getBillingAddressFromData()
                    );
                    selectBillingAddress(address);
                } else {
                    this.resolveBillingAddress();
                }
            }
        },

        /**
         * Resolve shipping address. Used local storage
         */
        resolveShippingAddress: function () {
            var newCustomerShippingAddress;

            if (!checkoutData.getShippingAddressFromData() &&
                window.checkoutConfig.shippingAddressFromData
            ) {
                checkoutData.setShippingAddressFromData(window.checkoutConfig.shippingAddressFromData);
            }

            newCustomerShippingAddress = checkoutData.getNewCustomerShippingAddress();

            if (newCustomerShippingAddress) {
                createShippingAddress(newCustomerShippingAddress);
            }
            this.applyShippingAddress();
        },

        /**
         * Apply resolved estimated address to quote
         *
         * @param {Object} isEstimatedAddress
         */
        applyShippingAddress: function (isEstimatedAddress) {            
            var address,
                shippingAddress,
                isConvertAddress,
                addressData,
                isShippingAddressInitialized;

            if (addressList().length === 0) {
                address = addressConverter.formAddressDataToQuoteAddress(
                    checkoutData.getShippingAddressFromData()
                );
                selectShippingAddress(address);
            }
            shippingAddress = quote.shippingAddress();
            isConvertAddress = isEstimatedAddress || false;

            // quote.shippingAddress().canUseForBilling(false);

            if (!shippingAddress) {
                isShippingAddressInitialized = addressList.some(function (addressFromList) {
                    if (checkoutData.getSelectedShippingAddress() == addressFromList.getKey()) { //eslint-disable-line
                        addressData = isConvertAddress ?
                            addressConverter.addressToEstimationAddress(addressFromList)
                            : addressFromList;
                        selectShippingAddress(addressData);

                        return true;
                    }

                    return false;
                });

                if (!isShippingAddressInitialized) {
                    isShippingAddressInitialized = addressList.some(function (addrs) {
                        if (addrs.isDefaultShipping()) {
                            addressData = isConvertAddress ?
                                addressConverter.addressToEstimationAddress(addrs)
                                : addrs;
                            selectShippingAddress(addressData);

                            return true;
                        }

                        return false;
                    });
                }

                if (!isShippingAddressInitialized && addressList().length === 1) {
                    addressData = isConvertAddress ?
                        addressConverter.addressToEstimationAddress(addressList()[0])
                        : addressList()[0];
                    selectShippingAddress(addressData);
                }
            }
            // cstm code = start
            setTimeout(function(){
                if (jQuery('ul.row.cstm-ul li').hasClass('cstm-selected-option')) {
                    console.log('removed cstm-selected-option');
                    jQuery('ul.row.cstm-ul li').removeClass('cstm-selected-option');    
                }
                jQuery('.totals.shipping.excl .mark .value').text('');
                console.log('checked cstm-selected-option');
            },2000);
            // cstm code = end
        },

        /**
         * @param {Object} ratesData
         */
        resolveShippingRates: function (ratesData) {            
            
            let customer_email = jQuery('#customer-email').val();
            let testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
            
            // custom show and hide section depending on the continue button on mobile view
            if (jQuery(window).width() < 768) {
                jQuery('.cstm-next-step1-mobile').on('click', function(){
                    if(jQuery('input[name="firstname"]').val() != '' && jQuery('input[name="lastname"]').val() != '' && jQuery('input[name="street[0]"]').val() != '' && jQuery('input[name="city"]').val() != '' && jQuery('input[name="postcode"]').val() != ''){
                        // if (testEmail.test(customer_email)){
                            jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).prop( "checked", false );
                            jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).attr('checked', false);

                            jQuery('#shipping-type-buttons-cstm').show("fast");
                            jQuery('#opc-shipping_method').show("fast");
                            jQuery('.checkout-shipping-method').show("fast");
                            jQuery('.cstm-next-step1-mobile').hide("fast");
                            jQuery('.cstm-edit-address').show("fast");
                            jQuery('.shipping_buttons').show("fast");

                            jQuery('#shipping .form.form-login').hide("fast");
                            // jQuery('#shipping .form.form-shipping-address').hide("fast");
                            jQuery('#shipping .form.form-shipping-address').addClass('cstm-hide');
                            jQuery('#shipping-type-buttons-cstm').css('border-top','0');
                        // }
                    } else {
                        jQuery('.cstm-error-msg-req').show("fast");
                        setTimeout(function(){
                            jQuery('.cstm-error-msg-req').hide("fast");
                        }, 4000);
                    }
                });   
                jQuery('.cstm-edit-address').on('click',function(){
                    jQuery('#shipping .form.form-login').show("fast");
                    // jQuery('#shipping .form.form-shipping-address').show("fast");
                    jQuery('#shipping .form.form-shipping-address').removeClass("cstm-hide");

                    jQuery('.cstm-edit-address').hide();
                    jQuery('.cstm-next-step1-mobile').show("fast");
                    jQuery('#shipping-type-buttons-cstm').hide("fast");
                    jQuery('#opc-shipping_method').hide("fast");
                    jQuery('#payment').hide("fast");
                    jQuery('.cstm-change-delivery-option').hide("fast");
                });           
                jQuery('.cstm-change-delivery-option').on('click',function(){
                    jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).prop( "checked", false );
                    jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).attr('checked', false);

                    jQuery('#shipping .form.form-login').hide();
                    // jQuery('#shipping .form.form-shipping-address').hide();
                    jQuery('#shipping .form.form-shipping-address').addClass('cstm-hide');
                    jQuery('#shipping-type-buttons-cstm').css('border-top','0');

                    jQuery('.cstm-change-delivery-option').hide();
                    jQuery('#shipping-type-buttons-cstm').show("fast");
                    jQuery('.shipping_buttons').show("fast");
                    jQuery('#opc-shipping_method').show("fast");
                    jQuery('.checkout-shipping-method').show("fast");
                    jQuery('#payment').hide("fast");
                });                
            }
            
            //custom code starts (show/hide checkout delivery/click-collect button)
            let isClickCollect = false;
            ratesData.forEach(function(data){                
                if(data.carrier_code == 'amstorepick'){
                    isClickCollect = true;
                } else {
                    isClickCollect = false;
                }
            });
            setTimeout(function () {
                
                jQuery('.opc-payment-additional.discount-code').remove();

                if(isClickCollect){
                    jQuery('.checkout-shipping-method > .step-title').hide();
                    jQuery('.button_delivery').hide();
                    jQuery('.cstm-eco-msg').hide();
                    jQuery('.cstm-clone-lead-time-summary').hide();
                    jQuery('.button_click_collect').show();
                    jQuery('.table-checkout-shipping-method').attr('id', 'cstm-has-storepick');
                    jQuery('.totals.shipping.excl > .mark > span.label').text('Collection Location');                        
                    jQuery('.totals.shipping.excl > .amount').hide();
                    // jQuery('.form-shipping-address').hide();
                    jQuery('.form-shipping-address').addClass('cstm-hide');
                    jQuery('#shipping-type-buttons-cstm').css('border-top','0');
                    jQuery('#shipping-type-buttons-cstm').find('.step-title').hide();
                    if (jQuery(window).width() < 768  && isClickCollect == true) {
                        jQuery('#shipping-type-buttons-cstm').show();
                        jQuery('#opc-shipping_method').show();
                        jQuery('.cstm-next-step1-mobile').hide();
                        jQuery('.cstm-edit-address').hide();
                    }
                }else{
                    jQuery('.table-checkout-shipping-method .row input.radio[name="shipping_method"]').prop( "disabled", false );
                    jQuery('.checkout-shipping-method > .step-title').show();
                    jQuery('.button_delivery').show();
                    jQuery('.cstm-eco-msg').show();
                    jQuery('.button_click_collect').hide();                        
                    if (ratesData.length === 1 && !quote.shippingMethod()) {
                        jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).prop( "checked", false );
                        jQuery( "#co-shipping-method-form #checkout-shipping-method-load .table-checkout-shipping-method > ul > li [name='shipping_method']" ).attr('checked', false);
                        setTimeout(function () {
                            var week  = jQuery('.cstm-product-lead-time span.product_lead_time').clone();
                            var text_week  = jQuery('.cstm-product-lead-time span').clone();
                            jQuery('.cstm-clone-lead-time-delivery').html(week); 
                            jQuery('.cstm-clone-lead-time-summary').html(text_week); 
                        }, 1000);
                    }
                }      
            }, 500);      

            ratesData.forEach(function(data){
                setTimeout(function () {
                    if (data.extension_attributes) {
                        if (data.extension_attributes.amstorepick_comment != 0) {                            
                            jQuery('.cstm-available-collection .one').show();
                            jQuery('.cstm-available-collection .two').show();

                            let myDate = new Date(new Date().getTime());
                            // var myDate = new Date(new Date().getTime()+(5*24*60*60*1000));

                            if(data.extension_attributes.amstorepick_comment.indexOf('london') != -1 || 
                                data.extension_attributes.amstorepick_comment.indexOf('London') != -1 ||
                                data.extension_attributes.amstorepick_comment.indexOf('richmond') != -1 || 
                                data.extension_attributes.amstorepick_comment.indexOf('Richmond') != -1 ||
                                data.extension_attributes.amstorepick_comment.indexOf('Albans') != -1 ||
                                data.extension_attributes.amstorepick_comment.indexOf('albans') != -1
                                ){
                                if(myDate.getDay() >= 1 && myDate.getDay() <= 3){ // 0-sun 1-mon 2-tues 3-wed 4-thurs 5-fri 6-sat
                                    var nextDate = new Date(new Date().getTime()+(2*24*60*60*1000));
                                } else {
                                    var nextDate = new Date(new Date().getTime()+(3*24*60*60*1000));
                                }
                                var date_val = jQuery.datepicker.formatDate('dd-mm-yy', nextDate);
                                jQuery('.cstm-available-collection #two_'+data.method_code).text(date_val);
                            } else if (data.extension_attributes.amstorepick_comment.indexOf('Steyning') != -1 || 
                                data.extension_attributes.amstorepick_comment.indexOf('steyning') != -1 || 
                                data.extension_attributes.amstorepick_comment.indexOf('Bristol') != -1 || 
                                data.extension_attributes.amstorepick_comment.indexOf('bristol') != -1
                                ) {
                                if(1<= myDate.getDay() <= 5){ // 0-sun 1-mon 2-tues 3-wed 4-thurs 5-fri 6-sat
                                    var nextDate = new Date(new Date().getTime()+(7*24*60*60*1000));
                                }
                                var date_val = jQuery.datepicker.formatDate('dd-mm-yy', nextDate);
                                jQuery('.cstm-available-collection #two_'+data.method_code).text(date_val);
                            } else {
                                // jQuery('.cstm-available-collection .one').hide();
                                jQuery('.cstm-available-collection #two_'+data.method_code).text('Date not confirmed');
                            }
                        }
                    }                    
                }, 1000);
            });

            let curMethodCode = quote.shippingMethod()?quote.shippingMethod()['method_code']:'';
            let curCarrierCode = quote.shippingMethod()?quote.shippingMethod()['carrier_code']:'';

            if(curMethodCode && curCarrierCode == 'amstorepick'){
                let methodSelection = '#label_method_' + curMethodCode + '_amstorepick';
                if (jQuery('#customer-email').val() != '') {
                    if (testEmail.test(customer_email)){
                        jQuery(methodSelection).closest('li').addClass('cstm-selected-option');    
                    }
                }
            }
            //custom code end

            var selectedShippingRate = checkoutData.getSelectedShippingRate(),
                availableRate = false;

            if (ratesData.length === 1 && !quote.shippingMethod()) {
                //set shipping rate if we have only one available shipping rate                
                selectShippingMethodAction(null);
                return;
            }

            if (quote.shippingMethod()) {
                availableRate = _.find(ratesData, function (rate) {
                    return rate['carrier_code'] == quote.shippingMethod()['carrier_code'] && //eslint-disable-line
                        rate['method_code'] == quote.shippingMethod()['method_code']; //eslint-disable-line eqeqeq
                });
            }

            if (!availableRate && selectedShippingRate) {
                availableRate = _.find(ratesData, function (rate) {
                    return rate['carrier_code'] + '_' + rate['method_code'] === selectedShippingRate;
                });
            }

            if (!availableRate && window.checkoutConfig.selectedShippingMethod) {
                availableRate = _.find(ratesData, function (rate) {
                    var selectedShippingMethod = window.checkoutConfig.selectedShippingMethod;

                    return rate['carrier_code'] == selectedShippingMethod['carrier_code'] && //eslint-disable-line
                        rate['method_code'] == selectedShippingMethod['method_code']; //eslint-disable-line eqeqeq
                });
            }

            //Unset selected shipping method if not available
            if (!availableRate) {                
                selectShippingMethodAction(null);
            } else {
                selectShippingMethodAction(availableRate);
            }
        },

        /**
         * Resolve payment method. Used local storage
         */
        resolvePaymentMethod: function () {
            var availablePaymentMethods = paymentService.getAvailablePaymentMethods(),
                selectedPaymentMethod = checkoutData.getSelectedPaymentMethod();

            if (selectedPaymentMethod) {
                availablePaymentMethods.some(function (payment) {
                    if (payment.method == selectedPaymentMethod) { //eslint-disable-line eqeqeq
                        selectPaymentMethodAction(payment);
                    }
                });
            }
        },

        /**
         * Resolve billing address. Used local storage
         */
        resolveBillingAddress: function () {
            var selectedBillingAddress,
                newCustomerBillingAddressData;

            if (!checkoutData.getBillingAddressFromData() &&
                window.checkoutConfig.billingAddressFromData
            ) {
                checkoutData.setBillingAddressFromData(window.checkoutConfig.billingAddressFromData);
            }

            selectedBillingAddress = checkoutData.getSelectedBillingAddress();
            newCustomerBillingAddressData = checkoutData.getNewCustomerBillingAddress();

            if (selectedBillingAddress) {
                if (selectedBillingAddress === 'new-customer-billing-address' && newCustomerBillingAddressData) {
                    selectBillingAddress(createBillingAddress(newCustomerBillingAddressData));
                } else {
                    addressList.some(function (address) {
                        if (selectedBillingAddress === address.getKey()) {
                            selectBillingAddress(address);
                        }
                    });
                }
            } else {
                this.applyBillingAddress();
            }
        },

        /**
         * Apply resolved billing address to quote
         */
        applyBillingAddress: function () {            
            var shippingAddress,
                isBillingAddressInitialized;

            if (quote.billingAddress()) {
                selectBillingAddress(quote.billingAddress());

                return;
            }

            if (quote.isVirtual() || !quote.billingAddress()) {
                isBillingAddressInitialized = addressList.some(function (addrs) {
                    if (addrs.isDefaultBilling()) {
                        selectBillingAddress(addrs);

                        return true;
                    }

                    return false;
                });            
            }

            shippingAddress = quote.shippingAddress();

             //custom code = start 
            let exist_value = [];

            jQuery.each(quote.getItems(), function (key,val) {
                if(jQuery.inArray(0, val['include_in_click_collect']) !== -1){
                    exist_value.push('exist');
                    return false;
                } else {
                    exist_value.push('not_exist');
                    return false;           
                }
            });

            if (exist_value[0] == 'not_exist') {
                jQuery('.checkout-billing-address .billing-address-form input[name="firstname"]').val('');
                jQuery('.checkout-billing-address .billing-address-form input[name="lastname"]').val('');
                jQuery('.checkout-billing-address .billing-address-form input[name="street[0]"]').val('');
                jQuery('.checkout-billing-address .billing-address-form input[name="street[1]"]').val('');
                jQuery('.checkout-billing-address .billing-address-form input[name="city"]').val('');
                jQuery('.checkout-billing-address .billing-address-form input[name="postcode"]').val('');
            } 
            var billingAddressData = checkoutData.getBillingAddressFromData();
            if(billingAddressData){
                billingAddressData.firstname   = '';
                billingAddressData.lastname    = '';
                // billingAddressData.street[0]   = '';
                // billingAddressData.street[1]   = '';
                billingAddressData.city        = '';
                billingAddressData.postcode    = '';
                checkoutData.setBillingAddressFromData(billingAddressData);
            }
            //custom code = end

            if (!isBillingAddressInitialized &&
                shippingAddress &&
                shippingAddress.canUseForBilling() &&
                (shippingAddress.isDefaultShipping() || !quote.isVirtual())
            ) {
                //set billing address same as shipping by default if it is not empty
                // selectBillingAddress(quote.shippingAddress());
            }
        }
    };
});
