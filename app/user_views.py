# encoding: utf-8
"""
@author: 叶玉
"""
import os
import uuid
from datetime import date

from flask import Blueprint, request, render_template, session, jsonify, g, url_for
from werkzeug.utils import redirect

from app.models import User, House, Facility, Area, db, HouseImage, Order

import random


# 生成蓝图对象
from app.form import UserRegisterForm
# 注册蓝图
from utils.settings import STATIC_PATH, MEDIA_PATH

blueprint = Blueprint('first', __name__)


@blueprint.route('/register/', methods=['GET'])
def register():
    # 注册页面 成功后跳转登录页面
    form = UserRegisterForm()
    if request.method == 'GET':
        return render_template('register.html', form=form)


@blueprint.route('/my_register/', methods=['POST'])
def my_register():
    mobile = request.form.get('mobile')   # 手机号
    security_code = request.form.get('imagecode')  # 验证码
    if security_code == session.get('security_code'):
        if User.query.filter(User.phone == mobile).first():
            return jsonify({'code': 500, 'msg': '用户已经存在，请重新注册！'})
        else:
            user = User()
            user.phone = request.form.get('mobile')
            user.password = request.form.get('passwd')
            # 保存
            user.add_update()
            return jsonify({'code':200})
    else:
        return jsonify({'code': 500, 'msg': '验证码不正确！'})


@blueprint.route('/security_code/', methods=['GET'])
def security_code():
    if request.method == 'GET':
        str_temp = '1234567890qwertyuiopasdfghjklzxcvbnm'
        security_code = '' # 验证码
        time = 1
        while time <= 4:
            security_code += random.choice(str_temp)
            time += 1
        # 将验证码存放在session
        session['security_code'] = security_code
        return jsonify({'code': 200, 'security_code':security_code})


@blueprint.route('/login/', methods=['GET'])
def login():
    # 登录页面
    if request.method == 'GET':
        return render_template('login.html')


@blueprint.route('/my_login/', methods=['POST'])
def my_login():
    if request.method == 'POST':
        mobile = request.form.get('mobile')  # 手机号
        passwd = request.form.get('passwd')  # 密码
        user = User.query.filter(User.phone == mobile).first()
        if user:
            if user.check_pwd(passwd):
                # 向session中存入登录信息
                session['user_id'] = user.id
                return jsonify({'code': 200, 'msg': '请求成功！'})
            else:
                return jsonify({'code': 501, 'msg': '密码不正确'})
        else:
            return jsonify({'code': 500, 'msg': '该用户不存在'})


@blueprint.route('/my/', methods=['GET'])
def my():
    # 个人中心
    if request.method == 'GET':
        id = session.get('user_id')
        user = User.query.get(id)
        name = user.name
        phone = user.phone
        avatar = user.avatar
        id_name = user.id_name
        id_card = user.id_card
        return render_template('my.html', name=name, phone=phone, avatar=avatar, id_name=id_name, id_card=id_card)


@blueprint.route('/my_info/', methods=['GET'])
def my_info():
    # 获取信息渲染到/user/my/
    if request.method == 'GET':
        pass


@blueprint.route('/profile/', methods=['GET', 'PATCH'])
def profile():
    # 修改个人中心
    if request.method == 'GET':
        id = session.get('user_id')
        user = User.query.get(id)
        name = user.name
        avatar = user.avatar
        return render_template('profile.html', name=name, avatar=avatar)
    if request.method == 'PATCH':
        # 改头像
        if request.files.get('avatar'):
            # 1.获取图片
            avatar = request.files.get('avatar')
            # 2.保存图片
            path = os.path.join(MEDIA_PATH, avatar.filename)
            avatar.save(path)
            # 3.修改字段
            user = User.query.filter(User.id == session['user_id']).first()
            user.avatar = avatar.filename
            user.add_update()
            return jsonify({'code': 200, 'msg': '保存图片成功', 'avatar': avatar.filename})

        if request.form.get('name'):
            # 1.获取姓名
            name = request.form.get('name')
            user = User.query.get(session['user_id'])
            user.name = name
            # 保存名字
            user.add_update()
            return jsonify({'code': 200, 'msg': '保存名字成功', 'name': user.name})



@blueprint.route('/auth/', methods=['GET', 'POST'])
# 实名认证
def auth():
    if request.method == 'GET':
        id = session.get('user_id')
        user = User.query.get(id)
        id_name = user.id_name
        id_card = user.id_card
        return render_template('auth.html', id_name=id_name, id_card=id_card)
    if request.method == 'POST':
        # 获取到姓名
        name = request.form.get('real_name')
        # 获取到身份证
        card = request.form.get('id_card')
        # 获取到用户信息
        user = User.query.get(session['user_id'])
        # 保存
        user.id_name = name
        user.id_card = card
        user.add_update()
        # return jsonify({'code': 200, 'msg': '保存信息成功', 'id_name': user.id_name, 'id_card': user.id_card})
        return render_template('auth.html', id_name=name, id_card=card)


@blueprint.route('/myhouse/', methods=['GET'])
# 我的房源
def myhouse():
    if request.method == 'GET':
        id = session.get('user_id')
        user = User.query.get(id)
        if all([user.id_name, user.id_card]):
            return render_template('myhouse.html', id_card=user.id_card)
        else:
            return render_template('myhouse.html')


@blueprint.route('/myhouse_ajax/', methods=['GET'])
def myhouse_ajax():
    if request.method == 'GET':
        # 返回所有发布的房源
        houses = House.query.all()
        list_house = []
        # 添加首图
        for house_index in houses:
            if not house_index:
                house = HouseImage.query.filter(HouseImage.house_id == house_index.id).all()[0]
                house_index.index_image_url = house.url
                house_index.add_update()
        for house in houses:
            list_house.append([house.id, house.title, house.address, house.price, house.update_time, house.index_image_url])
        return jsonify({'code': 200,  'list_house': list_house})


@blueprint.route('/newhouse/', methods=['GET'])
def newhouse():
    # 发布新的房源
    if request.method == 'GET':
        if request.method == 'GET':
            areas = Area.query.all()
            facilities = Facility.query.all()
            return render_template('newhouse.html', areas=areas, facilities=facilities)

        return render_template('newhouse.html')


@blueprint.route('/my_newhouse/', methods=['POST'])
def my_newhouse():
    # 新建房源
    if request.method == 'POST':
        # 获取输入的信息
        house_title = request.form.get('house_title')
        house_price = request.form.get('house_price')
        area_id = request.form.get('area_id')
        house_address = request.form.get('house_address')
        house_room_count = request.form.get('house_room_count')
        house_acreage = request.form.get('house_acreage')
        house_unit = request.form.get('house_unit')
        house_capacity = request.form.get('house_capacity')
        house_beds = request.form.get('house_beds')
        house_deposit = request.form.get('house_deposit')
        house_min_days = request.form.get('house_min_days')
        house_max_days = request.form.get('house_max_days')
        user_id = session.get('user_id')
        # 创建房屋信息
        house = House()
        house.user_id = user_id
        house.area_id = area_id
        house.title = house_title
        house.price = house_price
        house.address = house_address
        house.room_count = house_room_count
        house.acreage = house_acreage
        house.unit = house_unit
        house.capacity = house_capacity
        house.beds = house_beds
        house.deposit = house_deposit
        house.min_days = house_min_days
        house.max_days = house_max_days
        house.add_update()
        # 创建房屋设施
        checkbox_list = request.form.getlist('checkbox_list[]')
        for facility_id in checkbox_list:
            facility = Facility.query.get(facility_id)
            house.facilities.append(facility)
        db.session.commit()

        return jsonify({'code': 200, 'msg': '请求成功!', 'house_id': house.id})


@blueprint.route('/house_img/',  methods=['POST'])
def house_img():
    if request.method == 'POST':
        house_image = request.files.get('house_image')
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # 项目路径
        MEDIA_ROOT = os.path.join(os.path.join(BASE_DIR, 'static'),'media')  # 媒体文件路径
        path = os.path.join(MEDIA_ROOT, house_image.filename)
        house_image.save(path)

        # 保存房屋首图

        # 数据库保存文件
        houseimg = HouseImage()
        house_id = request.form.get('house_id')
        houseimg.house_id = house_id
        houseimg.url = house_image.filename
        houseimg.add_update()
        return jsonify({'code': 200, 'msg': '上传图片成功！', 'path': house_image.filename})


@blueprint.route('/index/', methods=['GET'])
def index():
    # 首页
    if request.method == 'GET':
        return render_template('index.html')


@blueprint.route('/index_ajax/', methods=['GET'])
def index_ajax():
    if request.method == 'GET':
        # 拿到用户id
        user_id = session.get('user_id')
        # 返回房屋信息, 前5个信息
        houses = House.query.all()[:4]
        house_temp = []  # 储存房间信息
        for house in houses:  # 取出每一个信息
            house_temp.append(house.to_dict())
            # 返回所有区域信息
            areas = Area.query.all()
            areas_temp = []  # 储存区域信息
        for area in areas:
            areas_temp.append(area.to_dict())
        return jsonify({'code': 200, 'msg': '请求参数成功', 'user_id': user_id, 'house_info': house_temp, 'area_info': areas_temp})


@blueprint.route('/search/', methods=['GET'])
# 搜索页面
def search():
    if request.method == 'GET':
        return render_template('search.html')


@blueprint.route('/search_ajax/', methods=['GET'])
def search_ajax():
    if request.method == 'GET':
        url = request.args.get('url')[1:]
        list_url = url.split('&')
        area_id = list_url[0][8:]  # 区域ID str
        sd = list_url[2][3:]  # 起始搜索时间 str
        ed = list_url[3][3:]  # 搜索截止时间 str
        # 1、拿到符合时间范围的房屋信息
        year, month, day = ed.split('-')
        day_end = date(int(year), int(month), int(day))
        year, month, day = sd.split('-')
        day_start = date(int(year), int(month), int(day))
        days = (day_end - day_start).days  # int
        houses = House.query.filter(House.area_id == area_id).filter(House.min_days <= days).order_by('-id').all()
        # 循环比较最大天数，把不符合最大入住天数的去除
        for house in houses:
            if int(house.max_days) == 0:
                continue
            if int(house.max_days) < days:
                houses.remove(house)

        # 到这里拿到所有house信息中符合入住时间的信息
        # 2、排除在入住时间内已经被人下单的房屋信息
        orders = Order.query.all()
        status = ['CANCELED', 'REJECTED']
        del_house_list = []  # 存放删除house信息的id
        for order in orders[:]:
            if order.status in status:
                del_house_list.append(order.house_id)
                orders.remove(order)
        for order in orders[:]:
            day1 = str(order.begin_date)[:10]
            year, month, day = day1.split('-')
            day1_new = date(int(year), int(month), int(day))
            day2 = str(order.end_date)[:10]
            year, month, day = day2.split('-')
            day2_new = date(int(year), int(month), int(day))
            if (not day_end - day2_new):
                del_house_list.append(order.house_id)
            if (not day1_new - day_start):
                del_house_list.append(order.house_id)
        # 3、删除所有删除列表中的房屋id信息
        for house in houses[:]:
            for id_del in del_house_list:
                if int(house.id) == int(id_del):
                    houses.remove(house)
        house_info = []  # 存放房屋信息
        for house in houses:
            dict_temp = house.to_dict()
            dict_temp['user_avatar'] = house.user.avatar if house.user.avatar else ''
            house_info.append(dict_temp)

        return jsonify({'code': 200, 'msg': '请求数据成功！', 'house_info': house_info})


@blueprint.route('/search_area/', methods=['GET'])
def search_area():
    """请求区域数据"""
    if request.method == 'GET':
        areas = Area.query.all()
        area_info = []
        for area in areas:
            area_info.append(area.to_dict())
        return  jsonify({'code':200, 'msg':'请求区域数据成功！','area_info':area_info})


@blueprint.route('/search_update/', methods=['GET'])
def search_update():
    """搜索点击更新页面"""
    if request.method == 'GET':
        areaId = request.args.get('areaId')
        startDate = request.args.get('startDate')
        endDate = request.args.get('endDate')
        sortKey = request.args.get('sortKey')
        if not areaId:
            return jsonify({'code':800, 'msg':'请选择位置区域！'})

        # 1、拿到符合时间范围的房屋信息
        year, month, day = endDate.split('-')
        day_end = date(int(year), int(month), int(day))
        year, month, day = startDate.split('-')
        day_start = date(int(year), int(month), int(day))
        days = (day_end - day_start).days     # int
        if sortKey == 'new':
            houses = House.query.filter(House.area_id == areaId).filter(House.min_days <= days).order_by('-id').all()
        elif sortKey == 'price-inc':
            # 价格升序
            houses = House.query.filter(House.area_id == areaId).filter(House.min_days <= days).order_by('price').all()
        elif sortKey == 'price-des':
            # 价格降序
            houses = House.query.filter(House.area_id == areaId).filter(House.min_days <= days).order_by('-price').all()
        # 循环比较最大天数，把不符合最大入住天数的去除
        for house in houses:
            if int(house.max_days) == 0:
                continue
            if int(house.max_days) < days:
                houses.remove(house)

        # 到这里拿到所有house信息中符合入住时间的信息
        # 2、排除在入住时间内已经被人下单的房屋信息
        orders = Order.query.all()
        status = ['CANCELED','REJECTED']
        del_house_list = []  # 存放删除house信息的id
        for order in orders[:]:
            if order.status in status:
                del_house_list.append(order.house_id)
                orders.remove(order)
        for order in orders[:]:
            day1 = str(order.begin_date)[:10]
            year, month, day = day1.split('-')
            day1_new = date(int(year), int(month), int(day))
            day2 = str(order.end_date)[:10]
            year, month, day = day2.split('-')
            day2_new = date(int(year), int(month), int(day))
            if (not day_end-day2_new):
                del_house_list.append(order.house_id)
            if (not day1_new-day_start):
                del_house_list.append(order.house_id)
        # 3、删除所有删除列表中的房屋id信息
        for house in houses[:]:
            for id_del in del_house_list:
                if int(house.id) == int(id_del):
                    houses.remove(house)
        house_info = []  # 存放房屋信息
        for house in houses:
            dict_temp = house.to_dict()
            dict_temp['user_avatar'] = house.user.avatar if house.user.avatar else ''
            house_info.append(dict_temp)

        return jsonify({'code':200, 'msg':'请求数据成功！', 'house_info':house_info})


@blueprint.route('/detail/', methods=['GET'])
# 房间信息
def detail():
    if request.method == 'GET':
        # 1.拿到该房间的信息
        houses_id = request.args.get('house_id')
        return render_template('detail.html', house_id=houses_id)


@blueprint.route('/detail_info/', methods=['POST'])
def detail_info():
    # 房屋信息
    if request.method == 'POST':
        house_id = request.form.get('house_id')
        house = House.query.filter(House.id == house_id).first()
        info = house.to_full_dict()
        return jsonify({'code': 200, 'msg': '请求数据成功！', 'info': info})


@blueprint.route('/booking/')
# 预定
def booking():
    if request.method == 'GET':
        house_id = request.args.get('house_id')
        return render_template('booking.html', house_id=house_id)


@blueprint.route('/booking_ajax/', methods=['POST'])
def bookimg_ajax():
    # 预定指定房间
    if request.method == 'POST':
        house_id = request.form.get('house_id')
        house = House.query.filter(House.id == house_id).first()
        return jsonify({'code': 200, 'msg': '请求数据成功！','min_day': house.min_days, 'max_day': house.max_days, 'house_info': house.to_dict()})


@blueprint.route('/add_order/', methods=['POST'])
def add_order():
    if request.method == 'POST':
        startdate = request.form.get('startdate')
        enddate = request.form.get('enddate')
        house_id = request.form.get('house_id')
        days = int(request.form.get('days'))
        house = House.query.filter(House.id == house_id).first()
        if int(house.max_days) == 0:
            max_day = 100000
        else:
            max_day = int(house.max_days)
        # 判断输入入住时间是否合法
        if all([startdate, enddate, house_id]):
            # 判断入住时间是否在范围内
            if (int(house.min_days) <= days <= max_day ):
                # 判断下单房源是不是自己发布的房源
                user_id = session.get('user_id')
                if house.user_id == user_id:
                    return jsonify({'code': 702, 'msg': '不能对自己的房源下单！'})
                else:
                    # 确定不是自己房源之后，执行下单操作
                    house_price = house.price
                    amount = house_price * days
                    status = "WAIT_ACCEPT"
                    # 创建订单
                    order = Order()
                    order.user_id = user_id
                    order.house_id = house_id
                    order.begin_date = startdate
                    order.end_date = enddate
                    order.days = days
                    order.house_price = house_price
                    order.amount = amount
                    order.status = status
                    order.add_update()
                    return jsonify({'code': 200, 'msg':'提交订单成功！'})
            else:
                return jsonify({'code':701, 'msg':'请输入在可入住范围内选择入住时间！'})
        else:
            return jsonify({'code': 700, 'msg':'请选择正确的入住时间！'})

@blueprint.route('/orders/', methods=['GET'])
def orders():
    # 用户的所有订单
    return render_template('orders.html')


@blueprint.route('/orders_ajax/', methods=['GET'])
def orders_ajax():
    if request.method == 'GET':
        id = session.get('user_id')
        # 获取用户的所有订单
        orders = Order.query.filter(Order.user_id == id).all()
        order_list = []
        for order in orders:
            order_list.append(order.to_dict())

        return jsonify({'code':200, 'msg':'请求数据成功！', 'order_info':order_list})


@blueprint.route('/comment/', methods=['GET'])
def comment():
    if request.method == 'GET':
        comment = request.args.get('comment')
        order_id = request.args.get('order_id')
        order = Order.query.filter(Order.id == order_id).first()
        order.comment = comment
        order.add_update()

        return jsonify({'code': 200, 'msg': '提交评价成功！'})


@blueprint.route('/lorders/', methods=['GET'])
def lorders():
    # 客户订单
    if request.method == 'GET':
        return render_template('lorders.html')


@blueprint.route('/lorders_ajax/', methods=['GET'])
def lorders_ajax():
    # 客户订单的ajax
    if request.method == 'GET':
        id = session.get('user_id')
        lorders_list = []  # 存储用户发布房屋的所有预约对象
        order_list = []  # 存储用户发布房屋的所有预约信息
        # 找到用户发布的房屋
        houses = House.query.filter(House.user_id==id).all()
        for house in houses:
            # 查看房屋对应的预约对象
            for order in house.orders:
                lorders_list.append(order)
        # 把所有对象的房屋信息保存在order_list中
        for order_two in lorders_list:
            order_list.append(order_two.to_dict())
        return jsonify({'code': 200, 'msg': '请求数据成功', 'order_info': order_list})


@blueprint.route('/logout/', methods=['GET'])
# 退出
def logout():
    if request.method == 'GET':
        # 在session中用pop移除user_id 返回登录页面
        session.pop('user_id')
        return jsonify({'code': 200, 'msg': '退出成功'})