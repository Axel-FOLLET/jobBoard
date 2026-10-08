from flask import Flask
from routes.ads import bp as ads_bp
from routes.auth import auth

from routes.admin import bp as admin_bp
from auth_utils import init_security

app = Flask(__name__)
init_security(app)
app.register_blueprint(ads_bp, url_prefix="/api")
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api")

#------ lance un serveur--------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
