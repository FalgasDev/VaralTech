from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.product_model import get_all_products, get_product_by_id, create_product, update_product, delete_product
from models.user_model import User
from errors import NotFoundError, EmptyStringError

product_blueprint = Blueprint('product', __name__)


def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@product_blueprint.route('/products', methods=['GET'])
def list_products():
    products = get_all_products(active_only=True)
    return jsonify(products), 200


@product_blueprint.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = get_product_by_id(product_id)
        return jsonify(product), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), 404


@product_blueprint.route('/admin/products', methods=['POST'])
@jwt_required()
def add_product():
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403
    try:
        p = create_product(request.json)
        return jsonify(p), 201
    except (KeyError, EmptyStringError) as e:
        return jsonify({'error': e.message if hasattr(e, 'message') else str(e)}), 400


@product_blueprint.route('/admin/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def edit_product(product_id):
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403
    try:
        p = update_product(product_id, request.json)
        return jsonify(p), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), 404


@product_blueprint.route('/admin/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_product(product_id):
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403
    try:
        delete_product(product_id)
        return jsonify({'status': 'Produto removido.'}), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), 404


@product_blueprint.route('/admin/products', methods=['GET'])
@jwt_required()
def admin_list_products():
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403
    products = get_all_products(active_only=False)
    return jsonify(products), 200
