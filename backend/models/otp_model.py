import random
from datetime import datetime, timedelta
from config.database import db
from errors import AuthError


class OTP(db.Model):
    __tablename__ = 'otps'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

    def __init__(self, user_id, code, expires_at):
        self.user_id = user_id
        self.code = code
        self.expires_at = expires_at


def generate_otp(user_id):
    OTP.query.filter_by(user_id=user_id, used=False).delete()
    db.session.commit()

    code = str(random.randint(100000, 999999))
    expires_at = datetime.now() + timedelta(minutes=15)

    new_otp = OTP(user_id=user_id, code=code, expires_at=expires_at)
    db.session.add(new_otp)
    db.session.commit()

    return code


def verify_otp(data):
    from models.user_model import User
    from flask_jwt_extended import create_access_token

    required_fields = ['email', 'code']
    if not all(field in data for field in required_fields):
        raise KeyError('Algum campo está faltando.')

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        raise AuthError('Usuário não encontrado.')

    otp = OTP.query.filter_by(user_id=user.id, used=False).order_by(OTP.id.desc()).first()

    if not otp:
        raise AuthError('Nenhum código encontrado. Faça o login novamente.')

    if otp.code != data['code']:
        raise AuthError('Código incorreto.')

    if datetime.now() > otp.expires_at:
        raise AuthError('Código expirado. Faça o login novamente.')

    otp.used = True
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return {'token': token, 'name': user.name, 'is_admin': user.is_admin}
