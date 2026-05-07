from config.database import app, db
from controllers.user_controller import user_blueprint
from controllers.product_controller import product_blueprint

app.register_blueprint(user_blueprint)
app.register_blueprint(product_blueprint)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Seed demo products if none exist
        from models.product_model import Product
        if Product.query.count() == 0:
            demo_products = [
                Product('Varal Retrátil Premium', 'Varal retrátil de aço inox com capacidade para 15kg. Ideal para espaços pequenos.', 189.90, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Varais', 25),
                Product('Varal de Parede Duplo', 'Varal fixo de parede em alumínio, dupla haste extensível até 2 metros.', 129.90, 'https://images.unsplash.com/photo-1521783988139-89397d761dce?w=600', 'Varais', 40),
                Product('Varal Inteligente Smart', 'Varal com sensor de chuva e motor elétrico. Recolhe automaticamente.', 459.90, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600', 'Smart', 10),
                Product('Pregador Silicone Pack 24', 'Kit 24 pregadores em silicone antideslizante. Resistente a UV.', 34.90, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 'Acessórios', 200),
                Product('Varal Tripé Dobrável', 'Varal tripé em aço com revestimento anticorrosão. Fácil de transportar.', 89.90, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Varais', 60),
                Product('Kit Organização Lavanderia', 'Kit completo com varal, cesto e suporte para tábua de passar.', 299.90, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600', 'Kits', 15),
            ]
            for p in demo_products:
                db.session.add(p)
            db.session.commit()
            print('Demo products seeded.')

    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
