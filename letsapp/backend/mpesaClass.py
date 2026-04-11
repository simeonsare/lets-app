import requests
import base64
from datetime import datetime
from django.conf import settings
from django.utils import timezone
import logging


logger = logging.getLogger(__name__)

class MPESAService:
    
    @staticmethod
    def get_access_token():
        url= f"{settings.MPESA_CONFIG['BASE_URL']}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(
            url,
            auth=(
                settings.MPESA_CONFIG['CONSUMER_KEY'],
                settings.MPESA_CONFIG['CONSUMER_SECRET']
            )
        )
        if response.status_code == 200:
            accesstoken = response.json().get('access_token')
            if not accesstoken:
                logger.error("Failed to retrieve access token from MPESA")
                return None
            return accesstoken
        else:
            logger.error(f"Failed to get access token: {response.status_code} - {response.text}")
            return None
    
    
    @staticmethod
    def stk_push(phone_number, amount, description):
        try:
            accesstoken = MPESAService.get_access_token()
            if not accesstoken:
                return {'success': False, 'errorMessage': 'Failed to get access token'}

            business_short_code = settings.MPESA_CONFIG['BUSINESS_SHORT_CODE']
            passkey = settings.MPESA_CONFIG['PASSKEY']
            phone_number = phone_number.replace('+', '').replace(' ', '')
            amount = int(float(amount))
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            data_to_encode = business_short_code + passkey + timestamp
            password = base64.b64encode(data_to_encode.encode()).decode()
            transaction_type = 'CustomerPayBillOnline'
            party_a = phone_number
            party_b = business_short_code

            data = {
                'BusinessShortCode': business_short_code,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': transaction_type,
                'Amount': amount,
                'PartyA': party_a,
                'PartyB': party_b,
                'PhoneNumber': phone_number,
                'CallBackURL': settings.MPESA_CONFIG['CALLBACK_URL'],
                'AccountReference': reference,
                'TransactionDesc': description,
            }
            headers = {
                "Authorization": f"Bearer {accesstoken}",
                "Content-Type": "application/json"
                }



            response = requests.post(
                f"{settings.MPESA_CONFIG['BASE_URL']}/mpesa/stkpush/v1/processrequest",
                json=data,
                headers=headers,
                timeout=10
            )

            logger.debug(f'MPESA STK Push request data: {data}')
            logger.debug(f'MPESA STK Push response: {response.text}')

            response_data = response.json()

            
            return response_data

        except Exception as e:
            logger.error(f"STK Push failed: {str(e)}", exc_info=True)
            return {'success': False, 'errorMessage': str(e)}


    
    @staticmethod
    def transfer_to_mentor(payment):
        """TODO: B2C transfer to mentor"""
        try:
            if not payment.recipient:
                return False
            
            # Get or create mentor wallet
            wallet, created = PaymentWallet.objects.get_or_create(
                user=payment.recipient
            )
            
            # Add to wallet balance (minus platform fee)
            transfer_amount = payment.net_amount
            wallet.balance += transfer_amount
            wallet.total_earned += transfer_amount
            wallet.save()
            # Log the transfer
            logger.info(f"Transferred {transfer_amount} to {payment.recipient.email} wallet")
            return True
            
        except Exception as e:
            logger.error(f"Mock caregiver transfer failed: {str(e)}")
            return False
    
    @staticmethod
    def process_withdrawal(withdrawal_request):
        """ B2C withdrawal processing"""
        try:
            # Implementation of actual B2C withdrawal logic here
            accesstoken = MPESAService.get_access_token()
        
            business_short_code = settings.MPESA_CONFIG['BUSINESS_SHORT_CODE']
            initiator_name = settings.MPESA_CONFIG['INITIATOR_NAME']
            security_credential = settings.MPESA_CONFIG['SECURITY_CREDENTIAL']
            amount = int(withdrawal_request.amount)
            party_a = business_short_code
            party_b = withdrawal_request.phone_number.replace('+', '')
            remarks = "Withdrawal"
            queue_timeout_url = settings.MPESA_CONFIG['QUEUE_TIMEOUT_URL']
            result_url = settings.MPESA_CONFIG['RESULT_URL']
            occasion = withdrawal_request.reference

            payload = {
            "InitiatorName": initiator_name,
            "SecurityCredential": security_credential,
            "CommandID": "BusinessPayment",
            "Amount": amount,
            "PartyA": party_a,
            "PartyB": party_b,
            "Remarks": remarks,
            "QueueTimeOutURL": queue_timeout_url,
            "ResultURL": result_url,
            "Occasion": occasion,
            }
            headers = {
            "Authorization": f"Bearer {accesstoken}",
            "Content-Type": "application/json"
            }
            url = f"{settings.MPESA_CONFIG['BASE_URL']}/mpesa/b2c/v1/paymentrequest"
            response = requests.post(url, json=payload, headers=headers)
            data = response.json()

            if response.status_code == 200 and data.get("ResponseCode") == "0":
                withdrawal_request.status = 'processing'
                withdrawal_request.save()
                logger.info(f"Withdrawal initiated: {withdrawal_request.reference}")
                return {
                    "success": True,
                    "conversation_id": data.get("ConversationID"),
                    "originator_conversation_id": data.get("OriginatorConversationID"),
                    "response_description": data.get("ResponseDescription"),
                }
            else:
                withdrawal_request.status = 'failed'
                withdrawal_request.failure_reason = data.get("errorMessage", "Unknown error")
                withdrawal_request.save()
                logger.error(f"Withdrawal failed: {withdrawal_request.reference} - {data}")
                return {
                    "success": False,
                    "error": data.get("errorMessage", "Withdrawal failed")
                }
        except Exception as e:
            logger.error(f"Withdrawal processing failed: {str(e)}")
            withdrawal_request.status = 'failed'
            withdrawal_request.failure_reason = str(e)
            withdrawal_request.save()
            return {
            "success": False,
            "error": str(e)
            }
