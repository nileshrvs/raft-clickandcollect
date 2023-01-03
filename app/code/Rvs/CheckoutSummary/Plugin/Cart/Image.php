<?php

namespace Rvs\CheckoutSummary\Plugin\Cart;

// use Magento\Checkout\Model\Session;

class Image
{
    // public function __construct(
    //     Session $session
    //     ){
    //     $this->_session = $session;
    // }
    public function afterGetImage($item, $result)
    {
        // $cart_items = $this->_session->getQuote()->getItems();
        
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        // date_default_timezone_set("Asia/Calcutta");   
        // $logger->info('Custom message------------------------------------------------------------'.date('h:i a')); 
        $_id = $item->getProduct()->getId();
        
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $product = $objectManager->create('Magento\Catalog\Model\Product')->load($_id);

        // echo $product->getName();
        // die();

        $connection = $objectManager->get('Magento\Framework\App\ResourceConnection')->getConnection('\Magento\Framework\App\ResourceConnection::DEFAULT_CONNECTION'); 

        
        // foreach ($cart_items as $i) {
        //     $options = $i->getProduct()->getTypeInstance(true)->getOrderOptions($i->getProduct());
        //     $logger->info(print_r(($options['options'][1]['value']), true));
        // }
        


        /* thum url */ 
        $storeManager = $objectManager->create('Magento\Store\Model\StoreManagerInterface'); 
        $currentStore = $storeManager->getStore();
        $mediaUrl = $currentStore->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA);
        if($item->getProductOptions()){    
            $options = $item->getProductOptions();
            if($options && count($options)!=0){
                $comb = $options[0]['value'].'_'.$options[1]['value'];
                $result1 = $connection->fetchAll("SELECT `image` FROM `wk_osi_variations` WHERE `product_id` = ".$product->getId()." AND `comb` = '".$comb. "' AND `image` != ''");
                $image_url = $storeManager->getStore()->getBaseUrl().'media/wkosi/products'.$result1[0]['image'];
            } else {
                $image_url = null;
            }
            
            if($image_url || $image_url != null || !empty($image_url)){
                $result->setImageUrl($image_url);
            }
        }
        return $result;
    }
}