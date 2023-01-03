<?php

namespace Rvs\Checkoutchanges\Plugin;

use Magento\Checkout\Model\Session as CheckoutSession;
use Magento\Quote\Api\CartItemRepositoryInterface as QuoteItemRepository;


class ConfigProviderPlugin extends \Magento\Framework\Model\AbstractModel
{
    
    private $checkoutSession;
    private $quoteItemRepository;
    protected $scopeConfig;

    public function __construct(
        CheckoutSession $checkoutSession,
        QuoteItemRepository $quoteItemRepository,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        $this->_scopeConfig = $scopeConfig;
        $this->checkoutSession = $checkoutSession;
        $this->quoteItemRepository = $quoteItemRepository;
    }


    public function afterGetConfig(\Magento\Checkout\Model\DefaultConfigProvider $subject, array $result)
    {
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);

        $quoteId = $this->checkoutSession->getQuote()->getId();            
        if ($quoteId) {
            $itemOptionCount = count($result['totalsData']['items']);
            $quoteItems = $this->quoteItemRepository->getList($quoteId);
            $isbnOptions = array();
            foreach ($quoteItems as $index => $quoteItem) {
                $quoteItemId = $quoteItem['item_id'];
                $isbnOptions[$quoteItemId] = $quoteItem['isbn'];               
            }
            
            $assigned_value = [];

            for ($i=0; $i < $itemOptionCount; $i++) {
                $quoteParentId = $result['totalsData']['items'][$i]['item_id'];
                $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
                // 

                $cart = $objectManager->get('\Magento\Checkout\Model\Cart'); 
                $itemsCollection = $cart->getQuote()->getItemsCollection();
                $itemsVisible = $cart->getQuote()->getAllVisibleItems();
                $items = $cart->getQuote()->getAllItems();

                

                foreach($items as $item) {
                    $productId = $item->getProductId();
                    $productObj = $objectManager->create('\Magento\Catalog\Model\Product')->load($productId);

                    $product_isClickCollect = $productObj->getData('include_in_click_collect');
                    
                    if($product_isClickCollect ==  null || $product_isClickCollect === 0 || $product_isClickCollect == 0 || !($product_isClickCollect)){
                        $product_isClickCollect_value = 0; 
                    } else {
                        $product_isClickCollect_value = 1; 
                    }
                    $assigned_value[] = $product_isClickCollect_value;

                    

                    $productFlavours = $productObj->getResource()->getAttribute('lead_time')->getFrontend()->getValue($productObj);
                    
                    if ($productFlavours) {
                        preg_match_all('!\d+!', $productFlavours, $matches);
                        foreach($matches as $max_days){
                            $result['quoteItemData'][$i]['lead_time'] = max($max_days) . ' weeks';
                        }
                    }
                }
                $result['quoteItemData'][$i]['include_in_click_collect'] = $assigned_value;
                // $logger->info(print_r($assigned_value, true));
                // $productId = $result['quoteItemData'][$i]['product']['entity_id'];
                // $productObj = $objectManager->create('\Magento\Catalog\Model\Product')->load($productId);

                json_encode($result);
                // return $result;
            }
        }
        return $result;
    }
}