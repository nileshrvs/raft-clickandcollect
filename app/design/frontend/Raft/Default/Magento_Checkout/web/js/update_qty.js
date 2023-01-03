define([
    'jquery',
    'Magento_Checkout/js/action/get-totals',
    'Magento_Customer/js/customer-data'
], function ($, getTotalsAction, customerData) {
    $(document).ready(function () {
        $(document).on('click', 'a.qty', function () {
            var $this = $(this),
                productId = $(this).parents('td').data('id'),
                updateInput = $("#cart-" + productId + "-qty"),
                currentQty = updateInput.val();

            if ($this.hasClass('-plus')) {
                var newAdd = parseInt(currentQty) + parseInt(1);
                updateInput.val(newAdd);
                ajaxUpdate();
            } else if ($this.hasClass('-minus')) {
                if (currentQty > 1) {
                    var newAdd = parseInt(currentQty) - parseInt(1);
                    updateInput.val(newAdd);
                }
                ajaxUpdate();
            }

        });
        $(document).on('change', 'input.input-text.qty', function () {
            var $this = $(this),
                productId = $(this).parents('td').data('id'),
                updateButton = $("#update-" + productId + "-qty");

            updateButton.show().removeClass('hidden').addClass('visible');
            $(updateButton).on('click', function () {
                ajaxUpdate();
            });
        });

        function ajaxUpdate() {
            var form = $('form#form-validate.form-cart');
            $.ajax({
                url: form.attr('action'),
                type: "POST",
                data: form.serialize(),
                showLoader: true,
                cache: false,
                success: function (res) {
                    var parsedResponse = $.parseHTML(res),
                        result = $(parsedResponse).find("#form-validate.form-cart"),
                        sections = ['cart'];

                    form.replaceWith(result);

                    // The mini cart reloading
                    customerData.reload(sections, true);

                    // The totals summary block reloading
                    var deferred = $.Deferred();
                    getTotalsAction([], deferred);
                },
                error: function (xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    console.log(err.Message);
                }
            });
            return true;
        };
    });
});
