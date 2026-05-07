from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from errors import EmptyStringError, AuthError, ForbiddenError
from models.user_model import register, login, User
from models.otp_model import verify_otp

user_blueprint = Blueprint('user', __name__)


def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


@user_blueprint.route('/register', methods=['POST'])
def register_user():
    data = request.json
    try:
        register(data)
        return jsonify({'status': 'Usuário cadastrado com sucesso!'}), 201
    except (KeyError, EmptyStringError, AuthError) as e:
        return jsonify({'error': e.message if hasattr(e, 'message') else str(e)}), 400


@user_blueprint.route('/login', methods=['POST'])
def login_user():
    data = request.json
    try:
        result = login(data)
        return jsonify(result), 200
    except (KeyError, EmptyStringError, AuthError) as e:
        return jsonify({'error': e.message if hasattr(e, 'message') else str(e)}), 400


@user_blueprint.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    data = request.json
    try:
        result = verify_otp(data)
        return jsonify(result), 200
    except (KeyError, AuthError) as e:
        return jsonify({'error': e.message if hasattr(e, 'message') else str(e)}), 400


@user_blueprint.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    return jsonify(user.to_dict()), 200


# ── Admin endpoints ──────────────────────────────────────────────────────────

@user_blueprint.route('/admin/users', methods=['GET'])
@jwt_required()
def list_users():
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403

    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@user_blueprint.route('/admin/users/<int:target_id>/make-admin', methods=['POST'])
@jwt_required()
def make_admin(target_id):
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403

    from config.database import db
    target = User.query.get(target_id)
    if not target:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    target.is_admin = True
    db.session.commit()
    return jsonify({'status': 'Admin concedido.', 'user': target.to_dict()}), 200


@user_blueprint.route('/admin/users/<int:target_id>/remove-admin', methods=['POST'])
@jwt_required()
def remove_admin(target_id):
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403

    if user.id == target_id:
        return jsonify({'error': 'Você não pode remover seu próprio admin.'}), 400

    from config.database import db
    target = User.query.get(target_id)
    if not target:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    target.is_admin = False
    db.session.commit()
    return jsonify({'status': 'Admin removido.', 'user': target.to_dict()}), 200


@user_blueprint.route('/admin/users/<int:target_id>', methods=['DELETE'])
@jwt_required()
def delete_user(target_id):
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403

    if user.id == target_id:
        return jsonify({'error': 'Você não pode deletar sua própria conta.'}), 400

    from config.database import db
    target = User.query.get(target_id)
    if not target:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    db.session.delete(target)
    db.session.commit()
    return jsonify({'status': 'Usuário removido.'}), 200


@user_blueprint.route('/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Acesso negado.'}), 403

    from models.product_model import Product
    total_users = User.query.count()
    total_admins = User.query.filter_by(is_admin=True).count()
    total_products = Product.query.filter_by(active=True).count()

    return jsonify({
        'total_users': total_users,
        'total_admins': total_admins,
        'total_products': total_products,
    }), 200
