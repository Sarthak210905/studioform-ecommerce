"""
Delhivery B2C API Integration Service
Handles shipment creation, tracking, and fulfillment
"""

import requests
from typing import Dict, List, Optional
from datetime import datetime
import json

from app.core.config import settings


class DelhiveryService:
    """Service for Delhivery B2C API integration"""
    
    def __init__(self):
        self.base_url = getattr(settings, 'DELHIVERY_API_URL', 'https://track.delhivery.com/api')
        self.api_key = getattr(settings, 'DELHIVERY_API_KEY', '')
        self.headers = {
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def check_serviceability(self, pincode: str) -> Dict:
        """
        Check if delivery is serviceable for a pincode
        """
        try:
            url = f"{self.base_url}/c/api/pin-codes/json/"
            params = {'filter_codes': pincode}
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('delivery_codes'):
                pincode_data = data['delivery_codes'][0]
                return {
                    'serviceable': True,
                    'city': pincode_data.get('district'),
                    'state': pincode_data.get('state_or_province'),
                    'cod_available': pincode_data.get('cod') == 'Y',
                    'prepaid_available': pincode_data.get('pre_paid') == 'Y',
                }
            
            return {'serviceable': False}
            
        except Exception as e:
            print(f"Delhivery serviceability check error: {str(e)}")
            return {'serviceable': False, 'error': str(e)}
    
    def get_tat(self, origin_pincode: str, destination_pincode: str) -> Dict:
        """
        Get estimated Transit Time (TAT) between pincodes
        """
        try:
            url = f"{self.base_url}/kinko/v1/tat"
            params = {
                'origin': origin_pincode,
                'destination': destination_pincode
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            return {
                'success': True,
                'tat_days': data.get('tat', 3),
                'estimated_delivery': data.get('expected_delivery_date')
            }
            
        except Exception as e:
            print(f"Delhivery TAT error: {str(e)}")
            return {'success': False, 'tat_days': 5, 'error': str(e)}
    
    def calculate_shipping_rate(
        self, 
        origin_pincode: str,
        destination_pincode: str, 
        weight_kg: float = 0.5,
        payment_mode: str = 'Prepaid',
        cod_amount: float = 0.0
    ) -> Dict:
        """
        Calculate shipping rate using Delhivery API
        
        Args:
            origin_pincode: Warehouse pincode
            destination_pincode: Customer pincode
            weight_kg: Package weight in kg
            payment_mode: 'Prepaid' or 'COD'
            cod_amount: COD collection amount
        
        Returns:
            Dict with shipping_cost, estimated_days, etc.
        """
        try:
            # Delhivery Kinko Rate Calculator API
            url = f"{self.base_url}/kinko/v1/invoice/charges/.json"
            
            params = {
                'md': 'S',  # Mode: S=Surface, E=Express
                'ss': 'Delivered',  # Service: Delivered/RTO
                'd_pin': destination_pincode,
                'o_pin': origin_pincode,
                'cgm': int(weight_kg * 1000),  # Weight in grams
                'pt': payment_mode,  # Payment type
                'cod': '1' if payment_mode == 'COD' else '0'
            }
            
            if payment_mode == 'COD' and cod_amount > 0:
                params['cod_amount'] = str(cod_amount)
            
            print(f"🚚 Delhivery API Request: {params}")
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            print(f"🚚 Delhivery API Response: {data}")
            
            if data and len(data) > 0:
                # Get first rate option (usually surface)
                rate_data = data[0]
                
                # Extract charges
                total_charge = float(rate_data.get('total_amount', 0))
                
                return {
                    'success': True,
                    'shipping_cost': round(total_charge, 2),
                    'base_charge': float(rate_data.get('freight_charge', 0)),
                    'cod_charge': float(rate_data.get('cod_charges', 0)) if payment_mode == 'COD' else 0,
                    'estimated_days': '3-7',
                    'service_type': 'Surface',
                    'currency': 'INR'
                }
            else:
                # Fallback to zone-based if API fails
                return {
                    'success': False,
                    'error': 'No rates available',
                    'fallback': True
                }
            
        except Exception as e:
            print(f"Delhivery rate calculation error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'fallback': True
            }

    
    def create_shipment(self, shipment_data: Dict) -> Dict:
        """
        Create a shipment in Delhivery
        
        shipment_data format:
        {
            'shipments': [{
                'name': 'Customer Name',
                'add': 'Address Line 1',
                'pin': '452001',
                'city': 'Indore',
                'state': 'Madhya Pradesh',
                'country': 'India',
                'phone': '9876543210',
                'order': 'ORDER123',
                'payment_mode': 'Prepaid/COD',
                'return_pin': '452001',
                'return_city': 'Indore',
                'return_state': 'Madhya Pradesh',
                'return_country': 'India',
                'return_name': 'Your Store Name',
                'return_add': 'Your Warehouse Address',
                'return_phone': 'Your Phone',
                'order_date': '2024-01-01 10:00:00',
                'total_amount': '500.00',
                'cod_amount': '0.00',  # 0 for prepaid
                'weight': '500',  # in grams
                'seller_name': 'Your Store',
                'quantity': '1',
                'waybill': '',  # Optional pre-generated waybill
                'shipment_width': '10',
                'shipment_height': '10',
                'shipping_mode': 'Surface',
                'address_type': 'home'
            }]
        }
        """
        try:
            url = f"{self.base_url}/cmu/create.json"
            
            # Format data for Delhivery API
            formatted_data = {
                'format': 'json',
                'data': json.dumps(shipment_data)
            }
            
            response = requests.post(
                url, 
                headers=self.headers,
                data=formatted_data
            )
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('success'):
                return {
                    'success': True,
                    'waybill': result.get('waybill'),
                    'shipment_id': result.get('shipment_id'),
                    'packages': result.get('packages', [])
                }
            else:
                return {
                    'success': False,
                    'error': result.get('remark') or result.get('error')
                }
                
        except Exception as e:
            print(f"Delhivery shipment creation error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def track_shipment(self, waybill: str) -> Dict:
        """
        Track a shipment by waybill number
        """
        try:
            url = f"{self.base_url}/v1/packages/json/"
            params = {'waybill': waybill}
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('ShipmentData'):
                shipment = data['ShipmentData'][0]['Shipment']
                scans = shipment.get('Scans', [])
                
                return {
                    'success': True,
                    'waybill': waybill,
                    'status': shipment.get('Status', {}).get('Status'),
                    'current_location': scans[0].get('ScannedLocation') if scans else None,
                    'expected_delivery': shipment.get('PromisedDeliveryDate'),
                    'scans': scans,
                    'delivery_date': shipment.get('DeliveredDate')
                }
            
            return {'success': False, 'error': 'Shipment not found'}
            
        except Exception as e:
            print(f"Delhivery tracking error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def create_pickup_request(self, pickup_data: Dict) -> Dict:
        """
        Create a pickup request (PUR)
        
        pickup_data format:
        {
            'pickup_location': 'Warehouse Name',
            'pickup_date': '2024-01-01',
            'pickup_time': '10:00',
            'expected_package_count': 5
        }
        """
        try:
            url = f"{self.base_url}/fm/request/new/"
            
            response = requests.post(url, headers=self.headers, json=pickup_data)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'success': result.get('success', False),
                'pickup_request_id': result.get('pickup_request_id'),
                'message': result.get('message')
            }
            
        except Exception as e:
            print(f"Delhivery pickup request error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_label(self, waybill: str) -> Optional[bytes]:
        """
        Generate shipping label PDF
        """
        try:
            url = f"{self.base_url}/api/p/packing_slip"
            params = {'wbns': waybill}
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            return response.content  # PDF bytes
            
        except Exception as e:
            print(f"Delhivery label generation error: {str(e)}")
            return None
    
    def cancel_shipment(self, waybill: str) -> Dict:
        """
        Cancel a shipment
        """
        try:
            url = f"{self.base_url}/api/p/edit"
            data = {
                'waybill': waybill,
                'cancellation': 'true'
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'success': result.get('success', False),
                'message': result.get('remark')
            }
            
        except Exception as e:
            print(f"Delhivery cancellation error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_warehouse_list(self) -> List[Dict]:
        """
        Get list of registered warehouses
        """
        try:
            url = f"{self.base_url}/backend/clientwarehouse/all/"
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            print(f"Delhivery warehouse list error: {str(e)}")
            return []


# Singleton instance
delhivery_service = DelhiveryService()
