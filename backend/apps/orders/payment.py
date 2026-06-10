"""Payment gateway adapters for گوهر ولا."""
import logging
from abc import ABC, abstractmethod

import requests

logger = logging.getLogger(__name__)


class PaymentAdapter(ABC):
    @abstractmethod
    def request_payment(self, order, callback_url: str) -> dict:
        """Initiate payment. Returns dict with status/redirect_url/authority/message."""

    @abstractmethod
    def verify_payment(self, order, params: dict) -> dict:
        """Verify payment after callback. Returns dict with status/transaction_id/message."""


class CardToCardAdapter(PaymentAdapter):
    """No-op adapter — order is marked pending and processed manually."""

    def request_payment(self, order, callback_url: str) -> dict:
        return {'status': 'card_to_card', 'redirect_url': '', 'message': 'کارت به کارت'}

    def verify_payment(self, order, params: dict) -> dict:
        return {'status': 'pending', 'transaction_id': '', 'message': 'در انتظار بررسی دستی'}


class ZarinPalAdapter(PaymentAdapter):
    """ZarinPal REST v4 payment gateway."""

    SANDBOX_BASE = 'https://sandbox.zarinpal.com/pg/v4/payment/'
    LIVE_BASE = 'https://api.zarinpal.com/pg/v4/payment/'
    SANDBOX_GATE = 'https://sandbox.zarinpal.com/pg/StartPay/'
    LIVE_GATE = 'https://www.zarinpal.com/pg/StartPay/'

    def __init__(self, merchant_id: str, sandbox: bool = True):
        self.merchant_id = merchant_id
        self.sandbox = sandbox
        self.base = self.SANDBOX_BASE if sandbox else self.LIVE_BASE
        self.gate = self.SANDBOX_GATE if sandbox else self.LIVE_GATE

    def request_payment(self, order, callback_url: str) -> dict:
        amount = int(order.total) * 10  # Toman → Rial
        payload = {
            'merchant_id': self.merchant_id,
            'amount': amount,
            'description': f'سفارش {order.order_number} — گوهر ولا',
            'callback_url': callback_url,
            'metadata': {'mobile': order.phone, 'email': order.email or ''},
        }
        try:
            res = requests.post(f'{self.base}request.json', json=payload, timeout=10)
            data = res.json()
            code = data.get('data', {}).get('code')
            if code == 100:
                authority = data['data']['authority']
                return {
                    'status': 'ok',
                    'redirect_url': f'{self.gate}{authority}',
                    'authority': authority,
                    'message': 'در حال انتقال به درگاه',
                }
            msg = data.get('errors', {}).get('message', 'خطا در ایجاد پرداخت')
            return {'status': 'error', 'message': msg}
        except Exception:
            logger.exception('ZarinPal request_payment error')
            return {'status': 'error', 'message': 'خطا در اتصال به درگاه پرداخت'}

    def verify_payment(self, order, params: dict) -> dict:
        if params.get('Status') != 'OK':
            return {'status': 'error', 'message': 'پرداخت لغو شد یا ناموفق بود'}
        authority = params.get('Authority', '')
        payload = {
            'merchant_id': self.merchant_id,
            'amount': int(order.total) * 10,
            'authority': authority,
        }
        try:
            res = requests.post(f'{self.base}verify.json', json=payload, timeout=10)
            data = res.json()
            code = data.get('data', {}).get('code')
            if code in (100, 101):
                return {
                    'status': 'ok',
                    'transaction_id': str(data['data'].get('ref_id', '')),
                    'message': 'پرداخت موفق',
                }
            return {'status': 'error', 'message': 'تأیید پرداخت ناموفق'}
        except Exception:
            logger.exception('ZarinPal verify_payment error')
            return {'status': 'error', 'message': 'خطا در تأیید پرداخت'}


class IDPayAdapter(PaymentAdapter):
    """IDPay payment gateway."""

    URL = 'https://api.idpay.ir/v1.1/payment'

    def __init__(self, api_key: str, sandbox: bool = True):
        self.api_key = api_key
        self.sandbox = sandbox
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': api_key,
            **(({'X-SANDBOX': '1'}) if sandbox else {}),
        }

    def request_payment(self, order, callback_url: str) -> dict:
        payload = {
            'order_id': order.order_number,
            'amount': int(order.total) * 10,
            'name': order.full_name,
            'phone': order.phone,
            'mail': order.email or None,
            'desc': f'سفارش {order.order_number} — گوهر ولا',
            'callback': callback_url,
        }
        try:
            res = requests.post(self.URL, json=payload, headers=self.headers, timeout=10)
            data = res.json()
            if res.status_code == 201 and 'link' in data:
                return {
                    'status': 'ok',
                    'redirect_url': data['link'],
                    'authority': data.get('id', ''),
                    'message': 'در حال انتقال به درگاه',
                }
            return {'status': 'error', 'message': data.get('error_message', 'خطا در ایجاد پرداخت')}
        except Exception:
            logger.exception('IDPay request_payment error')
            return {'status': 'error', 'message': 'خطا در اتصال به درگاه پرداخت'}

    def verify_payment(self, order, params: dict) -> dict:
        payload = {'id': params.get('id', ''), 'order_id': params.get('order_id', '')}
        try:
            res = requests.post(f'{self.URL}/verify', json=payload, headers=self.headers, timeout=10)
            data = res.json()
            if res.status_code == 200 and data.get('status') in (100, 101):
                return {
                    'status': 'ok',
                    'transaction_id': str(data.get('track_id', '')),
                    'message': 'پرداخت موفق',
                }
            return {'status': 'error', 'message': data.get('error_message', 'تأیید پرداخت ناموفق')}
        except Exception:
            logger.exception('IDPay verify_payment error')
            return {'status': 'error', 'message': 'خطا در تأیید پرداخت'}


def get_payment_adapter() -> PaymentAdapter:
    """Return the active payment adapter based on admin-configured PaymentSettings."""
    try:
        from apps.cms.models import PaymentSettings
        cfg = PaymentSettings.load()
        if cfg and cfg.online_enabled and cfg.merchant_id:
            if cfg.provider == 'zarinpal':
                return ZarinPalAdapter(cfg.merchant_id, cfg.sandbox)
            if cfg.provider == 'idpay':
                return IDPayAdapter(cfg.merchant_id, cfg.sandbox)
    except Exception:
        pass
    return CardToCardAdapter()
