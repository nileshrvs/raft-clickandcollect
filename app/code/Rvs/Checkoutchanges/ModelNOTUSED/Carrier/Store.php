<?php
/**
* @author Amasty Team
* @copyright Copyright (c) 2022 Amasty (https://www.amasty.com)
* @package Store Pickup for Magento 2
*/

namespace Rvs\Checkoutchanges\Model\Carrier;
use Magento\Framework\App\Area;
use Magento\Quote\Model\Quote\Address\RateRequest;
use Magento\Shipping\Model\Rate\Result;
class Store extends \Amasty\StorePickup\Model\Carrier\Store
{


    public function collectRates(RateRequest $request)
    {
        if (!$this->getConfigData('active')) {
            return false;
        }

        /** @var \Magento\Shipping\Model\Rate\Result $result */
        $result = $this->rateResultFactory->create();
        /** @var \Amasty\StorePickup\Model\ResourceModel\Label\Collection $customLabel */
        $customLabel = $this->labelCollectionFactory->create();
        /** @var \Amasty\StorePickup\Model\ResourceModel\Method\Collection $methodCollection */
        $methodCollection = $this->methodCollectionFactory->create();

        $storeId = $this->state->getAreaCode() == Area::AREA_ADMINHTML
            ? $this->getStoreIdFromQuoteItem($request) : $this->storeManager->getStore()->getId();
        $methodCollection
            ->addFieldToFilter('is_active', 1)
            ->addStoreFilter($storeId)
            ->addCustomerGroupFilter($this->getCustomerGroupId($request));

        /** @var \Amasty\StorePickup\Model\Rate $modelRate */
        $modelRate = $this->rateFactory->create();
        $rates = $modelRate->findBy($request, $methodCollection);
        $countOfRates = 0;
        foreach ($methodCollection as $customMethod) {
            $customLabelData = $customLabel->addFiltersByMethodIdStoreId($customMethod->getId(), $storeId)
                ->getLastItem();
            /** @var \Magento\Quote\Model\Quote\Address\RateResult\Method $method */
            $method = $this->rateMethodFactory->create();
            // record carrier information
            $method->setCarrier($this->_code);
            $method->setCarrierTitle($this->getConfigData('title'));

            if (isset($rates[$customMethod->getId()]['cost'])) {
                // record method information
                $method->setMethod($this->_code . $customMethod->getId());
                $label = $this->helperData->escapeHtml($customLabelData->getLabel());

                if ($label === null || $label === '') {
                    $methodTitle = __($customMethod->getName());
                } else {
                    $methodTitle = __($label);
                }
                $methodTitle = str_replace(static::VARIABLE_NAME, $rates[$customMethod->getId()]['time'], $methodTitle);
                $method->setMethodTitle($methodTitle);

                $method->setCost($rates[$customMethod->getId()]['cost']);
                $method->setPrice($rates[$customMethod->getId()]['cost']);

                $method->setPos($customMethod->getPos());

                // add this rate to the result
                $result->append($method);
                $countOfRates++;
            }

        }

        if (($countOfRates == 0) && ($this->getConfigData('showmethod') == 1)) {
            $error = $this->_rateErrorFactory->create();
            $error->setCarrier($this->_code);
            $error->setCarrierTitle($this->getConfigData('title'));
            $error->setErrorMessage($this->getConfigData('specificerrmsg'));
            $result->append($error);
        }

        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
         
        $restrictionFlag=0;
        $productAttributeValues = array();
        $shippWithCC = ['1'];
        $request->getAllItems();
        foreach ($request->getAllItems() as $item) {
            if ($item->getProduct()->getData('include_in_click_collect') || !empty($item->getProduct()->getData('include_in_click_collect'))) {
                $productAttributeValues[$item->getSku()]=$item->getProduct()->getData('include_in_click_collect');
            } else {
                $productAttributeValues[$item->getSku()]=0;
            }
            $logger->info(print_r($item->getSku(), true)); 
        }
        if(!in_array('0',$productAttributeValues)){

            $logger->info(print_r($productAttributeValues, true));

            $restrictionFlag = (count(array_intersect($productAttributeValues, $shippWithCC))) ? 'notrestrict' : 'restrict';
            if('notrestrict' == $restrictionFlag) {
                return $result;
            }
        }
    }
}
