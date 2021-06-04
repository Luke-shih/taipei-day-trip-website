from flask import Flask, request , render_template, jsonify, session, url_for, redirect
from flask.wrappers import Response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import math, os , json, re, pymysql, requests
from marshmallow.fields import Date, Email
from flask_cors import CORS
from datetime import date, datetime
from sqlalchemy.orm import query

from dotenv import load_dotenv
load_dotenv()
partnerKey = os.getenv("PARTNER_KEY")

app=Flask(__name__)
CORS(app, supports_credentials=True)
app.config["JSON_AS_ASCII"]=False # False 避免中文顯示為ASCII編碼
app.config["TEMPLATES_AUTO_RELOAD"]=True # True 當 flask 偵測到 template 有修改會自動更新
app.config["JSON_SORT_KEYS"]=False # False 不以物件名稱進行排序顯示
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://root:@localhost:3306/data"
app.secret_key = os.urandom(24)

@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

db = SQLAlchemy()
ma = Marshmallow()

# ----------------  models  ---------------- #
i = 0
def default():
    global i
    if i < 12:
        n = 0

    i += 1
    if i != 0 and i % 12 == 0:
        n = i / 12
        result = math.floor(n)

    n = i / 12
    result = math.floor(n)
    return

relations = db.table('relations',
                    db.Column('user_id', db.Integer,db.ForeignKey('user.id')),
                    db.Column('booking_id', db.Integer,db.ForeignKey('booking.id'))
                    )   

class travelSchema(ma.Schema):
	class Meta:
		fields = ('id', 'name', 'category', 'description', 'address', 'transport', 'mrt', 'latitude', 'longitude', 'images')

travelSchema = travelSchema(many=True)
relations = db.Table('relations',
                    db.Column('user_id', db.Integer,db.ForeignKey('user.id')),
                    db.Column('booking_id', db.Integer,db.ForeignKey('booking.id'))
                    )

class Attraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    transport = db.Column(db.Text)
    mrt = db.Column(db.String(255))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    images = db.Column(db.Text, nullable=False)
    bookings = db.relationship('Booking', backref='attraction', lazy=True)

    def __repr__(self):
        return f"Attraction('{self.id}','{self.name}', '{self.category}', '{self.description}', '{self.address}', '{self.transport}', '{self.mrt}', '{self.latitude}', '{self.longitude}', '{self.images}')"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', secondary=relations, lazy='subquery', backref=db.backref('user', lazy='dynamic'))

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    attraction_id = db.Column(
        db.Integer, 
        db.ForeignKey('attraction.id'),
        nullable=False
    )
    orders = db.relationship('Order', backref='orderBooking', lazy=True)

    def __repr__(self):
        return f'Booking({self.date}, {self.time}, {self.price})'

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(255))
    price = db.Column(db.Integer)
    status = db.Column(db.Integer)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=True)

    def __repr__(self):
        return f'Order({self.number}, {self.status}, {self.price})'

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    orders = db.relationship('Order', backref='orderContact', lazy=True)

    def __init__(self, name, email, phone):
        self.name = name
        self.email = email
        self.phone = phone

    def __repr__(self):
        return f'Contact({self.name}, {self.email}, {self.phone})'

# ----------------  route  ---------------- #

######################### api attractions #########################

@app.route("/api/attractions")
def attractions():
    page = request.args.get('page', 0, type = int)
    keyword = request.args.get('keyword', None)
    if keyword is None:
        sql_cmd_keyword = f"""SELECT * FROM attraction ORDER BY id LIMIT {int(page)*12},12;"""
        query = db.engine.execute(sql_cmd_keyword)
        output = travelSchema.dump(query)
        if output != []:
            for x in output:
                x['images'] = x['images'].split(",")
            return jsonify({"nextPage": page + 1, "data": output})
        else:
            return jsonify({"error": True, "message": "error"}), 500
    elif page is None:
        sql_cmd_pageNone = f"""
            SELECT * FROM attraction WHERE name LIKE "%%{keyword}%%"
        """
        query_data_page = db.engine.execute(sql_cmd_pageNone)
        keywordOutput = travelSchema.dump(query_data_page)
        return jsonify({"data": keywordOutput})
    else:
        sql_cmd = f"""SELECT * FROM attraction WHERE name LIKE "%%{keyword}%%" ORDER BY id LIMIT {int(page)*12},12;"""
        query_data = db.engine.execute(sql_cmd)
        output = travelSchema.dump(query_data)
        if output != []:
            if len(output) < 12:
                for y in output:
                    y['images'] = y['images'].split(",")
                return jsonify({"nextPage": None, "data": output})
            else:
                sql_cmd_check = f"""SELECT * FROM attraction WHERE name LIKE "%%{keyword}%%" ORDER BY id LIMIT {(int(page)+1)*12},12;"""
                query_data_check = db.engine.execute(sql_cmd_check)
                output_check = travelSchema.dump(query_data_check)
                if output_check != []:
                    return jsonify({"nextPage": page + 1, "data": output})
                else:
                    return jsonify({"nextPage": None, "data": output})
        else:
            return jsonify({"nextPage": None, "data":[]})

######################### api attraction/id #########################

@app.route("/api/attraction/<attractionId>")
def getAttById(attractionId):
    data = Attraction.query.filter_by(id=attractionId).first()

    if data:
        return jsonify({"data": {
            "id": data.id,
            "name": data.name,
            "category": data.category,
            "description": data.description,
            "address": data.address,
            "transport": data.transport,
            "mrt": data.mrt,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "image": [
                data.images.split(',')
            ]
        }})
    elif data is None:
        return jsonify({"error": True, "message": "景點編號錯誤"}), 400
    else:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

######################### api user #########################

@app.route("/api/user", methods=['POST', 'PATCH', 'DELETE', 'GET'])
def login():
    if request.method == 'POST': # signup
        name = request.json['name']
        email = request.json['email']
        password = request.json['password']

        mail = User.query.filter_by(email=email).first() # 檢查是否有重複
        if (mail != None):
            return jsonify({"error": True, "message": "email已註冊，請重新輸入"}), 400
        else:
            addUser = User(name, email, password)
            db.session.add(addUser)
            db.session.commit()
            return jsonify({"ok": True}), 201

    elif request.method == 'PATCH': # signin
        email = request.json['email']
        password = request.json['password']

        mail = User.query.filter_by(email=email).first()
        if mail is None:
            return jsonify({"error": True, "message": "沒有此用戶"}), 400
        else:
            if mail.password == password:
                session['email'] = mail.email
                return jsonify({"ok": True}), 201
            else:
                return jsonify({"error": True, "message": "密碼錯誤"}), 400

    elif request.method == 'DELETE':
        session.pop('email')
        return jsonify({"ok": True})

    else: # GET
        sesson = session.get('email')
        if sesson:
            query = User.query.filter_by(email=sesson).first()
            return jsonify({"data": {
                "id": query.id,
                "name": query.name,
                "email": query.email
            }})
        else:
            return jsonify({"message": None})

######################### api Booking #########################

@app.route("/api/booking", methods=['GET', 'POST', 'DELETE'])
def apiBooking():
    if request.method == 'DELETE':
        sess = session.get('email')
        if sess:
            currUser = User.query.filter_by(email=sess).first()
            checkExist = Booking.query.filter(
                Booking.user.any(email=currUser.email)).first()
            if checkExist:
                db.session.delete(checkExist)
                db.session.commit()
                return jsonify({"ok": True})
            else:
                return jsonify({"error": True, "message": "沒有任何要刪除的預訂信息"}), 400
        else:
            return jsonify({"error": True, "message": "不允許執行此操作"}), 403

    elif request.method == 'POST':
        sessionMail = session.get('email')
        if sessionMail:
            attractionId = request.json['attractionId']
            date = request.json['date']
            time = request.json['time']
            price = request.json['price']
            try:
                currUser = User.query.filter_by(email=sessionMail).first()
                attraction = Attraction.query.filter_by(id=attractionId).first()
                if attraction is None:
                    return jsonify({"error": True, "message": "景點編號不存在"}), 400
                # 確認同一使用者是否有重複預定同一景點同一天的情況
                queryExist = Booking.query.filter(Booking.user.any(email=currUser.email)).first()
                if queryExist != None: # 如果有值，覆蓋原本的
                    queryExist.attraction_id = attractionId
                    queryExist.date = date
                    queryExist.time = time
                    queryExist.price = price
                    if queryExist:
                        db.session.add(queryExist)
                        db.session.commit()
                        return jsonify({"ok": True})
                    else:
                        raise Exception()
                else: # 沒有值，直接將數據 copy
                    booking = Booking(date=date, time=time,price=price, attraction=attraction)
                    currUser.bookings.append(booking)
                    if booking:
                        db.session.add(currUser)
                        db.session.commit()
                        return jsonify({"ok": True})
                    else:
                        raise Exception()
            except Exception:
                return jsonify({"error": True, "message": "無法建立預定"}), 400
            except:
                return jsonify({"error": True, "message": "伺服器錯誤"}), 500
        else:
            return jsonify({"error": True, "message": "不允許執行此操作"}), 403

    else:  # GET
        sess = session.get('email')
        if sess:
            currUser = User.query.filter_by(email=sess).first()
            bookingData = Booking.query.filter(
                Booking.user.any(email=currUser.email)).first()
            if bookingData:
                db.session.commit()
                return jsonify({"data": {
                    "attraction": {
                        "id": bookingData.attraction.id,
                        "name": bookingData.attraction.name,
                        "address": bookingData.attraction.address,
                        "image": bookingData.attraction.images
                    },
                    "date": bookingData.date,
                    "time": bookingData.time,
                    "price": bookingData.price
                }})
                
            else:
                return jsonify({"error": True, "message": "沒有任何預訂信息"}), 400

        else:
            return jsonify({"error": True, "message": "不允許執行此操作"}), 403

######################### api order #########################

@app.route('/api/orders', methods=['POST'])
def order():
    sess = session.get('email')
    orderData = request.json['order']
    # print(orderData)
    contactName = orderData['trip']['attraction']
    # print(contactName)
    if sess:
        prime = request.json["prime"]
        orderData = request.json['order']
        contact = request.json['contact']

        contactName = contact['name']
        contactEmail = contact['email']
        contactPhone = contact['phone']
        orderDetails = request.json['order']
        # print(orderDetails['trip'])

        booking = Booking.query.filter_by(attraction_id=orderDetails['trip']['attraction']['id']).first()
        contact = Contact(contactName, contactEmail, contactPhone)
        if contact:
            db.session.add(contact)
            db.session.commit()
        else:
            return jsonify({"error": True, "message": "contact information error"}), 400

        order = Order(number=prime, price=orderData['price'],status='0', orderBooking=booking, orderContact=contact)
        try:
            if order:
                db.session.add(order)
                db.session.commit()
            else:
                raise Exception()
        except Exception:
            print("跑到這個錯誤")
            return jsonify({"error": True, "message": "contact information error"}), 400
        except:
            return jsonify({"error": True, "message": "伺服器錯誤"}), 500
        print("以上運作3")
        url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": partnerKey
        }

        primeData = {
            "prime": prime,
            "partner_key": partnerKey,
            "merchant_id": "s1415937_CTBC",
            "details": "",
            "amount": orderData['price'],
            "cardholder": {
                "name": contactName,
                "email": contactEmail,
                "national_id": "A123456789",
                "phone_number": contactPhone  
            }
        }
        result = requests.post(
            url, data=json.dumps(primeData), headers=headers)
        rawData = result.json()

        if rawData['status'] == 0:
            query = Order.query.filter_by(number=prime).first()
            if query:
                query.status = 1
                db.session.commit()
                return jsonify({"data": {
                    "number": order.number,
                    "payment": {
                        "status": rawData['status'],
                        "message": "付款成功"
                    }
                }})
            else:
                return jsonify({"error": True, "message": "update status order error更新訂單狀態錯誤??"}), 400
        else:
            return jsonify({"error": True, "number": order.number, "message": rawData["msg"]}), 400
    else:
        return jsonify({"error": True, "message": "不允許執行此操作"}), 403

@app.route('/api/order/<string:orderNumber>')
def orderNumber(orderNumber):
    sess = session.get('email')
    if sess:
        if orderNumber:
            currUser = User.query.filter_by(email=sess).first()
            contactData = Contact.query.filter_by(email=currUser.email).first()
            bookingData = Booking.query.filter(Booking.user.any(email=currUser.email)).first()
            if bookingData:
                attractionData = Attraction.query.filter_by(
                    id=bookingData.attraction_id).first()
                order = Order.query.filter_by(number=orderNumber).first()
                return jsonify({"data": {
                    "number": order.number,
                    "price": order.price,
                    "trip": {
                        "attraction": {
                            "id": attractionData.id,
                            "name": attractionData.name,
                            "address": attractionData.address,
                            "images": attractionData.images
                        },
                        "date": bookingData.date,
                        "time": bookingData.time
                    },
                    "contact": {
                        "name": contactData.name,
                        "email": contactData.email,
                        "phone": contactData.phone
                    },
                    "status": 1
                }})
            else:
                return jsonify({"error": True, "status": "failed", "message": None})
        else:
            return redirect(url_for('main.index'))
    else:
        return jsonify({"error": True, "status": "UnAutherize", "message": "you are not allow to do this action"}), 403
	
if __name__ == '__main__':
	with app.app_context():
		db.init_app(app)
	app.run(host="0.0.0.0", port=3000, debug=True)
