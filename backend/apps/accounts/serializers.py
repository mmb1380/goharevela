"""
Serializers for the accounts app.
"""
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for public user info."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'city', 'avatar', 'date_joined',
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.full_name


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='تکرار رمز عبور',
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name',
            'email', 'phone', 'password', 'password2',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def validate_phone(self, value: str) -> str:
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('این شماره موبایل قبلاً ثبت شده است.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'رمز عبور و تکرار آن یکسان نیستند.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        # Auto-generate unique username from phone number
        phone = validated_data.get('phone', '')
        username = f'user_{phone}'
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'user_{phone}_{counter}'
            counter += 1
        validated_data['username'] = username
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login via phone + password."""

    phone = serializers.CharField(label='شماره موبایل')
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        label='رمز عبور',
    )

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')

        try:
            user_obj = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError('شماره موبایل یا رمز عبور اشتباه است.')

        user = authenticate(
            request=self.context.get('request'),
            username=user_obj.username,
            password=password,
        )
        if not user:
            raise serializers.ValidationError('شماره موبایل یا رمز عبور اشتباه است.')
        if not user.is_active:
            raise serializers.ValidationError('حساب کاربری غیرفعال است.')

        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for reading and updating the current user's profile."""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone', 'address', 'city', 'postal_code', 'avatar',
            'date_joined',
        ]
        read_only_fields = ['id', 'username', 'phone', 'date_joined']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""

    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='رمز عبور فعلی',
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        label='رمز عبور جدید',
    )
    new_password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='تکرار رمز عبور جدید',
    )

    def validate_old_password(self, value: str) -> str:
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('رمز عبور فعلی اشتباه است.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'رمز عبور جدید و تکرار آن یکسان نیستند.'})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
