<?php

namespace Rvs\CheckoutSummary\Plugin\Minicart;

class Image
{

    public function aroundGetItemData($subject, $proceed, $item)
    {
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        date_default_timezone_set("Asia/Calcutta");   
        $logger->info('Custom message------------------------------------------------------------'.date('h:i a')); 

        $result = $proceed($item);

        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $product = $objectManager->create('Magento\Catalog\Model\Product')->load($result['product_id']);

        $connection = $objectManager->get('Magento\Framework\App\ResourceConnection')->getConnection('\Magento\Framework\App\ResourceConnection::DEFAULT_CONNECTION'); 

        $option_array = [];
        foreach ($product->getOptions() as $o) {
            foreach ($o->getValues() as $value) {
                array_push($option_array, $value->getTitle());    
            }
        }

        /* thum url */ 
        $storeManager = $objectManager->create('Magento\Store\Model\StoreManagerInterface'); 
        $currentStore = $storeManager->getStore();
        
        $mediaUrl = $currentStore->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA);

        // $logger->info(print_r(($result), true));
        if($result){    
            // $options = ;
            if($result['product_type'] == 'simple' && count($result['options'])!=0){
                $comb = $result['options'][0]['value'].'_'.$result['options'][1]['value'];
                $result1 = $connection->fetchAll("SELECT `image` FROM `wk_osi_variations` WHERE `product_id` = ".$product->getId()." AND `comb` = '".$comb. "' AND `image` != ''");
                $image_url = $storeManager->getStore()->getBaseUrl().'media/wkosi/products'.$result1[0]['image'];
            } else {
                $image_url = null;
            }
        }


        // if ($option_array || count($option_array) != 0) {

        //     $b = $option_array[0].'_'.$option_array[1];
        //     $result1 = $connection->fetchAll("SELECT `image` FROM `wk_osi_variations` WHERE `product_id` = ".$product->getId()." AND `comb` = '".$b. "' AND `image` != ''");
        //     $image_url = $storeManager->getStore()->getBaseUrl().'media/wkosi/products'.$result1[0]['image'];

        // } else {
        //     $image_url = null;
        // }
        

        // $logger->info(print_r(($result), true));

        if($product->getImage()){
            if($image_url || $image_url != null || !empty($image_url)){
                $result['product_image']['src'] = $image_url;
                // $result['product_image']['src'] = $mediaUrl.'catalog/product'.$product->getImage();
            } else {
                $result['product_image']['src'] = $mediaUrl.'catalog/product'.$product->getImage();
            }
        }
        else{
            $result['product_image']['src'];
        }
        return $result;
    }
}