import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState } from 'react'
import { ProgressBar } from 'react-step-progress-bar'
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Page from "./component/Page"
import axios from 'axios';
import io from "socket.io-client"
function App() {
  const [username, SetUserName] = useState('')
  const [divstyle, setStyle] = useState("container custom-container");
  const [msg,setMsg] = useState('')
  const [progressno, setProgressNo] = useState(0)
  const [scatterdata,setScatterData] = useState({})
  const [state, setState] = useState({})
  const [state1,setState1]=useState({})


  function apicall(){
    var axios = require('axios');
    var data = JSON.stringify({
      "name": username
    });

    var config = {
      method: 'post',
      url: 'http://127.0.0.1:5000/user',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  }
  

  const socket = io("http://127.0.0.1:5000",{
    transports:["websocket","polling"]
  })

  const handlUserNameChange = (e)=>{
    SetUserName(e.target.value);
  }

  const socketCall=()=>{
    console.log("in")
    apicall()
    socket.on("connect",()=>{
      console.log("Connected")

    })
    socket.once("data1",data=>{
      setProgressNo(data.progress)
      console.log(data)
    })
    socket.once("data2",data=>{
      setProgressNo(data.progress)
      console.log(data)
    })
    socket.once("data3",data=>{
      scatterfun(data)
      setProgressNo(data.progress)
    
      
    })
    socket.once("data4",data=>{
      setProgressNo(data.progress)
      console.log(data)
      barfun(data)
    })    
    
  }

  function barfun(brdata){
    setState1(
      {
          
        series: [{
          name: 'Sentiments',
          data: brdata.output
        }],
        options: {
          chart: {
            height: 350,
            type: 'bar',
          },
          plotOptions: {
            bar: {
              borderRadius: 10,
              dataLabels: {
                position: 'top', // top, center, bottom
              },
            }
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val + "%";
            },
            offsetY: -20,
            style: {
              fontSize: '12px',
              colors: ["#ffffff"]
            }
          },
          
          xaxis: {
            categories: ["Positive", "Neutral", "Negative"],
            position: 'bottom',
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            },
            crosshairs: {
              fill: {
                type: 'gradient',
                gradient: {
                  colorFrom: '#D8E3F0',
                  colorTo: '#BED1E6',
                  stops: [0, 100],
                  opacityFrom: 0.4,
                  opacityTo: 0.5,
                }
              }
            },
            tooltip: {
              enabled: true,
            }
          },
          yaxis: {
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false,
            },
            labels: {
              show: false,
              formatter: function (val) {
                return val + "%";
              }
              
            }
          
          },
          title: {
            text: 'Sentiment Analysis',
            floating: true,
            offsetY: 330,
            align: 'center',
            style: {
              color: '#ffffff'
            }
          }
        },
      }
    )
  }

  function scatterfun(scdata){
    console.log(scdata.output[2])
    setState({ 
      series: [{
        name: scdata.output[0].name,
        data: [
          ...scdata.output[0].datas
        ]
      },{
        name: scdata.output[1].name,
        data: [
          ...scdata.output[1].datas
        ]

      },{
        name: scdata.output[2].name,
        data: [
          ...scdata.output[2].datas
        ]
      }],
      options: {
        chart: {
          height: 350,
          type: 'scatter',
          zoom: {
            enabled: true,
            type: 'xy'
          }
        },
        xaxis: {
          tickAmount: 10,
          labels: {
            formatter: function(val) {
              return parseFloat(val).toFixed(1)
            }
          }
        },
        yaxis: {
          tickAmount: 10
        }
      },     
  })
  }

  function handleSubmit(){
   // alert(username)
    setStyle("container custom-container2")
    socketCall()
  }

  return (
    <div className="App">
      <div className={divstyle} >
        <div className="custom-class">
        
          <div className="row mb-3 ">
            
            <label forname="inputEmail3" className="col-sm-2 col-form-label">Username</label>
            <div className="col-sm-10">
              <input type="email" className="form-control border-removed-input" onChange={(e)=>{handlUserNameChange(e)}} id="inputEmail3" />
            </div>        
            </div>
            <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
            
        </div>
      </div>
      <div className="container custom-container">
        <h1>{username}</h1>
        {progressno>=25 && progressno!=100 ? <ProgressBar
              filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
              percent={progressno}
            />:null}
        <div className="row m-5">
          <div className="col-md-4">
            {progressno===100 ? <ReactApexChart options={state.options} series={state.series} type="scatter" height={350} /> : null}          
          </div>
          <div className="col-md-4">
            {progressno===100 ? <ReactApexChart options={state1.options} series={state1.series} type="bar" height={350} />: null}
          </div>
        </div>        
      </div>
      
    </div>
  );
}

export default App;
