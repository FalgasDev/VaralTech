from config.database import db
from errors import EmptyStringError, NotFoundError


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    stock = db.Column(db.Integer, default=0, nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)

    def __init__(self, name, description, price, image_url=None, category=None, stock=0):
        self.name = name
        self.description = description
        self.price = price
        self.image_url = image_url
        self.category = category
        self.stock = stock

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'image_url': self.image_url,
            'category': self.category,
            'stock': self.stock,
            'active': self.active
        }


def get_all_products(active_only=True):
    query = Product.query
    if active_only:
        query = query.filter_by(active=True)
    return [p.to_dict() for p in query.all()]


def get_product_by_id(product_id):
    p = Product.query.get(product_id)
    if not p:
        raise NotFoundError('Produto não encontrado.')
    return p.to_dict()


def create_product(data):
    required = ['name', 'price']
    if not all(f in data for f in required):
        raise KeyError('Campos obrigatórios faltando.')
    if not data['name'] or not data['price']:
        raise EmptyStringError('Nome e preço são obrigatórios.')

    p = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        image_url=data.get('image_url'),
        category=data.get('category'),
        stock=data.get('stock', 0)
    )
    db.session.add(p)
    db.session.commit()
    return p.to_dict()


def update_product(product_id, data):
    p = Product.query.get(product_id)
    if not p:
        raise NotFoundError('Produto não encontrado.')

    for field in ['name', 'description', 'price', 'image_url', 'category', 'stock', 'active']:
        if field in data:
            setattr(p, field, data[field])

    db.session.commit()
    return p.to_dict()


def delete_product(product_id):
    p = Product.query.get(product_id)
    if not p:
        raise NotFoundError('Produto não encontrado.')
    p.active = False
    db.session.commit()


def reactivate_product(product_id):
    p = Product.query.get(product_id)
    if not p:
        raise NotFoundError('Produto não encontrado.')
    p.active = True
    db.session.commit()
    return p.to_dict()


def checkout_products(items):
    """
    items: list of { id, qty }
    Decrements stock for each product.
    Deactivates product if stock reaches 0.
    Returns list of updated products.
    Raises ValueError if any item has insufficient stock.
    """
    from errors import EmptyStringError

    # Validate all items before touching the DB
    products = []
    for item in items:
        p = Product.query.get(item['id'])
        if not p or not p.active:
            raise NotFoundError(f'Produto #{item["id"]} não encontrado ou inativo.')
        if p.stock < item['qty']:
            raise EmptyStringError(
                f'Estoque insuficiente para "{p.name}". Disponível: {p.stock}.'
            )
        products.append((p, item['qty']))

    # Apply changes
    updated = []
    for p, qty in products:
        p.stock -= qty
        if p.stock <= 0:
            p.stock = 0
            p.active = False
        updated.append(p.to_dict())

    db.session.commit()
    return updated
