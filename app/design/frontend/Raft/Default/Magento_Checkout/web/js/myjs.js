require([
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/select-shipping-method'
], function (checkoutData,selectShippingMethodAction) {

    // if customer first adds the click&collect product and then adds the deliverable product then it will remove the filled fields of shipping address
    jQuery(document).ready(function(){
        var shippingAddressData = checkoutData.getShippingAddressFromData();

        let isDeliverable = false;
        window.checkoutConfig.activeCarriers.forEach(function(data){                
            if(data != 'amstorepick'){
                isDeliverable = true;
            } else {
                isDeliverable = false;
            }
        });

        setTimeout(() => {
            if(shippingAddressData){
                if (shippingAddressData.firstname == 'Store' && shippingAddressData.lastname == 'Pickup' && isDeliverable == true) {
                    jQuery('.form-shipping-address input[name="firstname"]').val('');
                    jQuery('.form-shipping-address input[name="lastname"]').val('');
                    jQuery('.form-shipping-address input[name="street[0]"]').val('');
                    jQuery('.form-shipping-address input[name="street[1]"]').val('');
                    jQuery('.form-shipping-address input[name="city"]').val('');
                    jQuery('.form-shipping-address input[name="postcode"]').val('');
    
                    if(shippingAddressData){
                        shippingAddressData.firstname   = '';
                        shippingAddressData.lastname    = '';
                        shippingAddressData.street[0]   = '';
                        shippingAddressData.street[1]   = '';
                        shippingAddressData.city        = '';
                        shippingAddressData.postcode    = '';
                        checkoutData.setShippingAddressFromData(shippingAddressData);
                    }    
                    selectShippingMethodAction(null);
                }
            }
            

            // removing class from selected store
            // jQuery(window).load(function() {
            //     setTimeout(function(){
            //         // debugger;
            //         if (jQuery('ul.row.cstm-ul li').hasClass('cstm-selected-option')) {
            //             console.log('removed cstm-selected-option');
            //             jQuery('ul.row.cstm-ul li').removeClass('cstm-selected-option');    
            //         }
            //         console.log('checking cstm-selected-option');
            //     },3000);
            // });
            
        }, 1000);
    });
    

});
