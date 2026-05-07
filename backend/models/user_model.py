import bcrypt
from config.database import db
from errors import EmptyStringError, AuthError
from models.otp_model import generate_otp


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    def __init__(self, name, email, password, is_admin=False):
        self.name = name
        self.email = email
        self.password = password
        self.is_admin = is_admin

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_admin': self.is_admin
        }


def register(data):
    required_fields = ['name', 'email', 'password']
    if not all(field in data for field in required_fields):
        raise KeyError('Algum campo está faltando.')

    if not data['name'] or not data['email'] or not data['password']:
        raise EmptyStringError('Todos os campos têm que estar preenchidos.')

    if User.query.filter_by(email=data['email']).first():
        raise AuthError('Já existe um usuário cadastrado com este email.')

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed.decode('utf-8')
    )

    db.session.add(new_user)
    db.session.commit()


def login(data):
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        raise KeyError('Algum campo está faltando.')

    if not data['email'] or not data['password']:
        raise EmptyStringError('Todos os campos têm que estar preenchidos.')

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        raise AuthError('Email ou senha incorretos.')

    senha_correta = bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8'))

    if not senha_correta:
        raise AuthError('Email ou senha incorretos.')

    code = generate_otp(user.id)

    return {'otp_code': code, 'email': user.email, 'name': user.name}
