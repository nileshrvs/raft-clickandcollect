<?php

namespace Rvs\Checkoutchanges\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Event\Observer;
 
class ChangeProductImage implements ObserverInterface
{     
    public function execute(Observer $observer)
    {
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);

        $item = $observer->getEvent()->getData('quote_item');
        $product = $observer->getEvent()->getData('product');
        
        $item = ($item->getParentItem() ? $item->getParentItem() : $item);

        $objectManager = \Magento\Framework\App\ObjectManager::getInstance(); 

        $productRepository = $objectManager->get('\Magento\Catalog\Model\ProductRepository');
        $productObj = $productRepository->get($item->getSku());

        $logger->info('Custom message:'.date('Y/m/d H:i:s')); 

        $connection = $objectManager->get('Magento\Framework\App\ResourceConnection')->getConnection('\Magento\Framework\App\ResourceConnection::DEFAULT_CONNECTION'); 

        $a = [];
        foreach ($productObj->getOptions() as $o) {
            
            foreach ($o->getValues() as $value) {
                // print_r($value->getData());
                array_push($a, $value->getTitle());
                
            }
        }
        // $logger->info(print_r(gettype($a[0].'_'.$a[1]), true));
        // .$a[0]."_".$a[1].
        $b = $a[0].'_'.$a[1];
        $logger->info(print_r($b, true));
        // $result1 = $connection->fetchAll("SELECT * FROM `wk_osi_variations` WHERE (`product_id` = ".$productObj->getId()." AND `comb` = `".$a[0]."_".$a[1]."`) LIMIT 50");

        $result1 = $connection->fetchAll("SELECT `image` FROM `wk_osi_variations` WHERE `product_id` = ".$productObj->getId()." AND `comb` = '".$b."' AND `image` != ''");

        // $result1 = $connection->fetchAll("SELECT * FROM `wk_osi_variations` WHERE (`comb` = '".$b."') LIMIT 50");

        // set your custom price
        // $price = 100;
        
        // $item->setOriginalCustomPrice($price);
        // $item->getProduct()->setIsSuperMode(true);

        // $logger->info('Custom message'.time()); 
        // $logger->info(print_r($productObj->getOptions(), true));
        // $logger->info(print_r(get_class_methods($item), true));
        $storeManager = $objectManager->get('\Magento\Store\Model\StoreManagerInterface');
        
        $image_url = $storeManager->getStore()->getBaseUrl().'media/wkosi/products'.$result1[0]['image'];
        $item->setImageUrl($image_url);

        $logger->info(print_r($item->getImageUrl(), true));


    }
}