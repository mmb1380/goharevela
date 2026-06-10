"""SMS adapters for گوهر ولا."""
import logging
from abc import ABC, abstractmethod

import requests

logger = logging.getLogger(__name__)


class SmsAdapter(ABC):
    @abstractmethod
    def send_otp(self, phone: str, code: str) -> bool:
        """Send OTP code to phone. Returns True on success."""

    @abstractmethod
    def send_order_confirmation(self, phone: str, order_number: str, amount: str) -> bool:
        """Send order confirmation SMS. Returns True on success."""


class NullSmsAdapter(SmsAdapter):
    """Used when SMS is disabled — logs messages instead of sending."""

    def send_otp(self, phone: str, code: str) -> bool:
        logger.info('[SMS disabled] OTP for %s: %s', phone, code)
        return True

    def send_order_confirmation(self, phone: str, order_number: str, amount: str) -> bool:
        logger.info('[SMS disabled] Order %s confirmed for %s', order_number, phone)
        return True


class KavenegarAdapter(SmsAdapter):
    """Kavenegar SMS gateway."""

    BASE = 'https://api.kavenegar.com/v1'

    def __init__(self, api_key: str, sender: str = '', otp_template: str = '', order_template: str = ''):
        self.api_key = api_key
        self.sender = sender
        self.otp_template = otp_template
        self.order_template = order_template

    def send_otp(self, phone: str, code: str) -> bool:
        if self.otp_template:
            url = f'{self.BASE}/{self.api_key}/verify/lookup.json'
            data = {'receptor': phone, 'token': code, 'template': self.otp_template}
        else:
            url = f'{self.BASE}/{self.api_key}/sms/send.json'
            data = {'receptor': phone, 'message': f'کد تأیید گوهر ولا: {code}'}
            if self.sender:
                data['sender'] = self.sender
        try:
            res = requests.post(url, data=data, timeout=10)
            return res.status_code == 200
        except Exception:
            logger.exception('Kavenegar send_otp error')
            return False

    def send_order_confirmation(self, phone: str, order_number: str, amount: str) -> bool:
        if self.order_template:
            url = f'{self.BASE}/{self.api_key}/verify/lookup.json'
            data = {
                'receptor': phone,
                'token': order_number,
                'token2': amount,
                'template': self.order_template,
            }
        else:
            url = f'{self.BASE}/{self.api_key}/sms/send.json'
            data = {
                'receptor': phone,
                'message': f'سفارش {order_number} ثبت شد. مبلغ: {amount} تومان. گوهر ولا',
            }
            if self.sender:
                data['sender'] = self.sender
        try:
            res = requests.post(url, data=data, timeout=10)
            return res.status_code == 200
        except Exception:
            logger.exception('Kavenegar send_order_confirmation error')
            return False


class SmsIrAdapter(SmsAdapter):
    """SMS.ir gateway."""

    BASE = 'https://api.sms.ir/v1'

    def __init__(self, api_key: str, sender: str = '', otp_template_id: str = ''):
        self.api_key = api_key
        self.sender = sender
        self.otp_template_id = otp_template_id
        self.headers = {'Content-Type': 'application/json', 'x-api-key': api_key}

    def send_otp(self, phone: str, code: str) -> bool:
        if self.otp_template_id:
            url = f'{self.BASE}/send/verify'
            payload = {
                'mobile': phone,
                'templateId': int(self.otp_template_id),
                'parameters': [{'name': 'CODE', 'value': code}],
            }
        else:
            url = f'{self.BASE}/send/bulk'
            payload = {
                'lineNumber': self.sender,
                'MessageText': f'کد تأیید گوهر ولا: {code}',
                'Mobiles': [phone],
            }
        try:
            res = requests.post(url, json=payload, headers=self.headers, timeout=10)
            return res.status_code == 200
        except Exception:
            logger.exception('SmsIr send_otp error')
            return False

    def send_order_confirmation(self, phone: str, order_number: str, amount: str) -> bool:
        url = f'{self.BASE}/send/bulk'
        payload = {
            'lineNumber': self.sender,
            'MessageText': f'سفارش {order_number} ثبت شد. مبلغ: {amount} تومان. گوهر ولا',
            'Mobiles': [phone],
        }
        try:
            res = requests.post(url, json=payload, headers=self.headers, timeout=10)
            return res.status_code == 200
        except Exception:
            logger.exception('SmsIr send_order_confirmation error')
            return False


def get_sms_adapter() -> SmsAdapter:
    """Return the active SMS adapter based on admin-configured SmsSettings."""
    try:
        from apps.cms.models import SmsSettings
        cfg = SmsSettings.load()
        if cfg and cfg.enabled and cfg.api_key:
            if cfg.provider == 'kavenegar':
                return KavenegarAdapter(cfg.api_key, cfg.sender, cfg.otp_template, cfg.order_confirm_template)
            if cfg.provider == 'smsir':
                return SmsIrAdapter(cfg.api_key, cfg.sender, cfg.otp_template)
    except Exception:
        pass
    return NullSmsAdapter()
