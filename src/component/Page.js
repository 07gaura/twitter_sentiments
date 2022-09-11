import React from "react"
import {useEffect, useState } from 'react'
import ReactApexChart from "react-apexcharts";
const Page=({movie})=>{
    const [arr,setArr]=useState([])
    
    
    const [state, setState] = useState({ 
        series: [{
          name: "SAMPLE A",
          data: [
            movie
          ]
        },{
          name: "SAMPLE B",
          data: [
          
          ]
  
        },{
          name: "SAMPLE C",
          data: [
          
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
            tickAmount: 7
          }
        },     
    })
    return (
            <div>
                
                     
            </div>
    )
}
export default Page