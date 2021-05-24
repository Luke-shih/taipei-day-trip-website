from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import json, math, re
from datetime import datetime
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:1234@localhost:3306/data"
                                                      # user_name/password/IP/db_name

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

    def __repr__(self):
        return f'Booking({self.date}, {self.time}, {self.price})'

def data():
    with open("taipei-attractions.json", mode="r", encoding="utf-8") as file:
        result = json.load(file)
    finalData = result["result"]["results"]

    for result in finalData:
        name = result["stitle"]
        category = result["CAT2"]
        description = result['xbody']
        address = result['address']
        transport = result['info']
        mrt = result['MRT']
        latitude = result['latitude']
        longitude = result["longitude"]
        result = ",".join(result["file"].replace("http", " http").split(' ')[1:])
        match = re.findall(r'http.*jpg|http.*png', result, re.I)
        images = ",".join(match)

        travel = Attraction(name=name, category=category, description=description, address=address, transport=transport, mrt=mrt, latitude=latitude, longitude=longitude, images=images)
        db.session.add(travel)
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.init_app(app)
        db.create_all()
        data()
        
    app.run(port=5000)
