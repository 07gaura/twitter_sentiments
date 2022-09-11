import base64
import time
from threading import Thread, Lock
from flask import Flask,request
from flask_socketio import SocketIO, emit
import pandas as pd
import tweepy
import re
from wordcloud import WordCloud, STOPWORDS
from textblob import TextBlob
import os
import matplotlib.pyplot as plt
import seaborn as sns
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*")
@app.route("/user",methods=["POST"])
def demo():
    data = None
    if request.content_type=="application/json":
        data = request.json


    if os.path.isfile("user.txt") != True:
        with open("user.txt",'w') as file:
            file.write(data["name"])
    else:
        with open("user.txt",'w') as file:
            file.write(data["name"])
    return data

#@socketio.on('connect')
def ws_connect():
    try:
        data = {
            "progress": 25,
            "data": None,
            "status": "Data Found"
        }
        emit("data1", data, broadcast=True)
        data["progress"]=50
        emit("data2",data,broadcast=True)
    except Exception as e:
        pass

def get_date(username):
    bearer_token = 'AAAAAAAAAAAAAAAAAAAAADvVggEAAAAAUk07Rd983sFc6ERVvDVD3Y2JvIY%3DKoKb5AHPdPq5po6izyEUInrSDOsK62Lt8SbKNPwIUUuCwLQNHb'
    client = tweepy.Client(bearer_token=bearer_token)

    # Replace user ID
    id = None
    user_data = client.get_users(usernames=username)
    for i in user_data.data:
        id = i["id"]
    tweets = client.get_users_tweets(id=id, tweet_fields=['context_annotations', 'created_at', 'geo'], max_results=100)
    count = 1
    posts = tweets.data
    tweet_data = {
        "tweets": []
    }
    for i in posts:
        tweet_data["tweets"].append(i["text"])
        count += 1
    return tweet_data

def cleanTxt(text):
    text = re.sub('@[A-Za-z0-9]+',' ',text)
    text = re.sub('#',' ',text)
    text = re.sub('RT[\s]+',' ',text)
    text = re.sub('https?:\/\/\S+',' ',text)
    return text

def getSubjectivity(text):
    return TextBlob(text).sentiment.subjectivity

def getPolarity(text):
    return TextBlob(text).sentiment.polarity

def framing_dataframe(tweet_data):
    df = pd.DataFrame(tweet_data)
    df['tweets'] = df['tweets'].apply(cleanTxt)
    df["subjectivity"] = df['tweets'].apply(getSubjectivity)
    df['polarity'] = df['tweets'].apply(getPolarity)
    allwords = " ".join([twts for twts in df['tweets']])
    wordCloud = WordCloud(width=500, height=300, random_state=21, max_font_size=119).generate(allwords)
    #plt.imshow(wordCloud, interpolation="bilinear")
    #plt.axis('off')
    #plt.show()
    #plt.savefig('foo.png')
    #plt.close()
    return df

def encoded_image():
    with open("foo.png",'rb') as file:
        encoded_string = base64.b64encode(file.read())
    return encoded_string

def getAnalysis(score):
    if score < 0:
        return "Negative"
    elif score==0:
        return "Neutral"
    else:
        return "Positive"

def scatter_plot_data(df):
    output = []
    sentiments = ["Negative", "Neutral", "Positive"]
    for i in sentiments:
        data = []
        dicts = {}
        dicts["name"] = i
        for x, y in zip(df[df['Analysis'] == i]["polarity"], df[df['Analysis'] == i]["subjectivity"]):
            li = [x, y]
            data.append(li)
        dicts["datas"] = data
        output.append(dicts)
    return output

def analysis_percentage(df):
    positive = (df[df['Analysis'] == "Positive"]["Analysis"].count() / df["Analysis"].count()) * 100
    negative = (df[df['Analysis'] == "Negative"]["Analysis"].count()/df["Analysis"].count())*100
    neutral = (df[df['Analysis']=="Neutral"]["Analysis"].count()/df["Analysis"].count())*100
    return [positive,neutral,negative]

@socketio.on('msg')
def ws_msg(msg):
    print("recieved msg {}".format(msg))

@socketio.on('connect')
def echo(msg):
    #while True:
        #data = sock.recieve()
        #sock.send(data)
    username = None
    with open("user.txt",'r') as file:
        username = file.read()

    print("recieved msg {}".format(msg))
    tweet_data = get_date(username)
    data = {
        "progress":25,
        "data": None,
        "status":"Data Found"
    }
    emit("data1",data,broadcast=True)
    print("Data Found")
    df = framing_dataframe(tweet_data)
    data['progress']=50
    data['status']="Data Framed"
    emit("data2", data, broadcast=True)
    print("data framed and got image")
    #print(encoded_image())
    df["Analysis"] = df["polarity"].apply(getAnalysis)
    data["output"] = scatter_plot_data(df)
    data['progress'] = 70
    data['status'] = "Scatter Data"

    emit("data3", data, broadcast=True)
    data["output"] = analysis_percentage(df)
    data['progress'] = 100
    data['status'] = "analysis Data"
    emit("data4", data, broadcast=True)
    #return "Hello World"

if __name__=="__main__":
    socketio.run(app,allow_unsafe_werkzeug=True)