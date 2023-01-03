<?php
namespace Rvs\Checkoutchanges\Plugin;
class RestrictshippingPlugin
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    protected $checkoutSession;

    /**
     * @param \Magento\Checkout\Model\Session $checkoutSession
     */   
    public function __construct(
        \Magento\Checkout\Model\Session $checkoutSession
    ) {
        $this->checkoutSession = $checkoutSession;
    }

    /**
     * Hide specific shipping methods
     *
     */
    public function afterEstimateByExtendedAddress(\Magento\Quote\Api\ShipmentEstimationInterface $subject, $methods) 
    {
        $items = $this->checkoutSession->getQuote()->getAllVisibleItems();
        
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        
        foreach($methods as $key => &$method) {
            if (str_contains($method->getMethodCode(), 'amstorepick')) { 
                // $logger->info(print_r($method->getMethodCode().': true', true)); 
                if($this->_checkMethodForClickCollect())
                { 
                    unset($methods[$key]);                                 
                }
            } 

            if (!str_contains($method->getMethodCode(), 'amstorepick')) { 
                if($this->_checkMethodForOther())
                { 
                    unset($methods[$key]);
                }
            } 
        }
        return $methods;
    }
    
    private function _checkMethodForOther(){
        $items = $this->checkoutSession->getQuote()->getAllItems();
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        
        $restrictionFlag=0;
        $productAttributeValues = array();
        $shippWithOther = ['1'];

        $renderMethod = false;
        foreach($items as $item)
        {
            if($item->getProduct()->getTypeId() == 'simple'){
                if ($item->getProduct()->getData('include_in_click_collect') || !empty($item->getProduct()->getData('include_in_click_collect'))) {
                    $productAttributeValues[$item->getSku()]=$item->getProduct()->getData('include_in_click_collect');
                } else {
                    $productAttributeValues[$item->getSku()]=0;
                }
            }
        }

        if(!in_array('0',$productAttributeValues)){
            $restrictionFlag = (count(array_intersect($productAttributeValues, $shippWithOther))) ? 'notrestrict' : 'restrict';
            if('notrestrict' == $restrictionFlag) {
                $renderMethod = true;
            } else {
                $renderMethod = false;                
            }
        } else {
            $renderMethod = false;                
        }
        return $renderMethod; 
    }

    private function _checkMethodForClickCollect(){
        $items = $this->checkoutSession->getQuote()->getAllItems();
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/custom.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        
        $restrictionFlag=0;
        $productAttributeValues = array();
        $shippWithCC = ['1'];

        $renderMethod = false;
        foreach($items as $item)
        {
            if($item->getProduct()->getTypeId() == 'simple'){
                if ($item->getProduct()->getData('include_in_click_collect') || !empty($item->getProduct()->getData('include_in_click_collect'))) {
                    $productAttributeValues[$item->getSku()]=$item->getProduct()->getData('include_in_click_collect');
                } else {
                    $productAttributeValues[$item->getSku()]=0;
                }
            }
        }

        if(!in_array('0',$productAttributeValues)){
            $restrictionFlag = (count(array_intersect($productAttributeValues, $shippWithCC))) ? 'notrestrict' : 'restrict';
            if('notrestrict' == $restrictionFlag) {
                $renderMethod = false;
            } else {
                $renderMethod = true;                
            }
        } else {
            $renderMethod = true;                
        }
        return $renderMethod; 
    }
}