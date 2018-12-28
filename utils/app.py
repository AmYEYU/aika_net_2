# encoding: utf-8
"""
@author: 叶玉
"""
from app.models import db
from app.user_views import blueprint
from utils.config import Conf
from flask import Flask

from utils.settings import STATIC_PATH, TEMPLATE_PATH


def create_app():

    app = Flask(__name__,
                static_folder=STATIC_PATH,
                template_folder=TEMPLATE_PATH)
    # 加载配置文件
    app.config.from_object(Conf)
    # 蓝图
    app.register_blueprint(blueprint=blueprint, url_prefix='/user')
    # 初始化
    db.init_app(app)
    return app
