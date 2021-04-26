from flask import Flask, request, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import math, json

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False # False 避免中文顯示為ASCII編碼
app.config["TEMPLATES_AUTO_RELOAD"]=True # True 當 flask 偵測到 template 有修改會自動更新
app.config["JSON_SORT_KEYS"]=False # False 不以物件名稱進行排序顯示
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:1234@localhost:3306/data"


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

class travel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    transport = db.Column(db.Text)
    mrt = db.Column(db.String(255))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    images = db.Column(db.String(255), nullable=False)
    page = db.Column(db.Integer, primary_key=False, default=default)

    def __repr__(self):
        return f"travel('{self.name}', '{self.category}', '{self.description}', '{self.address}', '{self.transport}', '{self.mrt}', '{self.latitude}', '{self.longitude}', '{self.images}', '{self.page}')"

class travelSchema(ma.Schema):
	class Meta:
		fields = ('id', 'name', 'category', 'description', 'address', 'transport', 'mrt', 'latitude', 'longitude', 'images')

travelSchema = travelSchema(many=True)

@app.route("/api/attractions")
def attractions():
    page = request.args.get('page', 0, type = int)
    keyword = request.args.get('keyword', None)

    if keyword is None:
        data = travel.query.filter_by(page = page).all()
        if data:
            output = travelSchema.dump(data)
            return jsonify({"nextPage": page +1, "data": output})
        else:
            return jsonify({"error": True, "message": "error"}), 500
    elif page is None:
        sql_cmd_pageNone = f"""SELECT * FROM travel WHERE name LIKE "%%{keyword}%%"""
        query_data_page = db.engine.execute(sql_cmd_pageNone)
        keywordOutput = travelSchema.dump(query_data_page)
        return jsonify({"data": keywordOutput})
    else:
        sql_cmd = f"""SELECT * FROM travel WHERE name LIKE "%%{keyword}%%" ORDER BY id LIMIT {int(page)*12},12;"""
        query_data = db.engine.execute(sql_cmd)
        output = travelSchema.dump(query_data)
        if output != []:
            if len(output) < 12:
                return jsonify({"nextPage": None, "data": output})
            else:
                sql_cmd_check = f"""SELECT * FROM travel WHERE name LIKE "%%{keyword}%%" ORDER BY id LIMIT {(int(page)+1)*12},12;"""
                query_data_check = db.engine.execute(sql_cmd_check)
                output_check = travelSchema.dump(query_data_check)
                if output_check != []:
                    return jsonify({"nextPage": page + 1, "data": output})
                else:
                    return jsonify({"nextPage": None, "data": output})
        else:
            return jsonify({"nextPage": None, "data":[]})

@app.route("/api/attraction/<attractionId>")
def getAttById(attractionId):
    data = travel.query.filter_by(id=attractionId).first()

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
                data.images
            ]
        }})
    elif data is None:
        return jsonify({"error": True, "message": "景點編號錯誤"}), 400
    else:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

if __name__ == '__main__':
	with app.app_context():
		db.init_app(app)
	app.run(host="0.0.0.0", port=3000)
