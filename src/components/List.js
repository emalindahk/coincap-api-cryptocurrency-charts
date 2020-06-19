import React, { useState, useEffect} from 'react';
import { Table } from 'reactstrap';
import CanvasJSReact from '../canvasjs.react';
import moment from 'moment';


var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const List = (props) => {
  const [state, setState] = useState({
    rowID: null,
    clicked: false,
    history: null,
    loadingHistory: false
  })


  const options = {
    data: [{
      type: "line",
      dataPoints: state.history
     }]
  }

  const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours +''+ ampm;
    return strTime.toUpperCase();
  }

  const fetchHistory = (currency, historyInterval) => {
    fetch(`https://api.coincap.io/v2/assets/${currency}/history?interval=${historyInterval}`)
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      const finalData = [];
          let count = 0;
          for (let date in data.bpi){
            finalData.push({
              d: moment(date).format('MMM DD'),
              p: data.bpi[date].toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }),
              x: count, //previous days
              y: data.bpi[date] // numerical price
            });
            count++;
          }
          setState(prev =>({
            ...prev,
            loadingHistory: true,
            history: finalData
          }));
          fetchHistory();
        })
      // const finalData = data.data.map(hist => (
      //   {
      //     label: formatAMPM(new Date(hist.time)),
      //     d: 
      //     y: Math.floor(hist.priceUsd),
      //     x: new Date(hist.time).getHours()
      //   }
      // ))
      // console.log("FINAL", finalData)
      // setState(prev=>({
      //   ...prev,
      //   loadingHistory: true,
      //   history: finalData
      // }));
    
  }
  const intervals = ['m1', 'm5', 'm15', 'm3', 'h1', 'h2', 'h6', 'h12', 'd1']
  const { assets } = props;
  const fallbackUrl = 'https://img.icons8.com/color/50/000000/average-2.png';

  return (
    <div style={{ cursor: 'pointer', userSelect: 'none' }}>
      <Table hover>
        <thead>
          <tr>
            {/* to do -toggle this column  */}
            {/* <th> Rank </th> */}
            <th> Name </th>
            <th> Price </th>
            <th> Changes(24Hr)</th>
          </tr>
        </thead>
        <tbody>

          {console.log(state) || assets && assets.data.map((asset) => {
            return (
              <>
                <tr key={asset.id} onClick={() => setState(prev => ({
                  rowID: asset.id,
                  clicked: !prev.clicked
                }))}>
                  {/* <td>{asset.rank}</td> */}
                  <td>
                    <img src={`https://static.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} width="48" onError={() => fallbackUrl} alt="" />
                    <h3 style={{ fontSize: 18 }}>{asset.name}</h3>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{asset.symbol}</p>
                  </td>
                  <td style={{ fontWeight: 600 }}>USD {Math.floor(asset.priceUsd * 1).toFixed(2)}</td>
                  <td style={{ color: styles.changePercentColor(asset), fontWeight: 600 }}>{(asset.changePercent24Hr * 1).toFixed(2)} %</td>
                  <td>
                  </td>
                </tr>

                {
                  state.clicked && state.rowID == asset.id && (
                    <>
                      <div style={styles.div}>
                        <div style={styles.tabParent}>
                        {
                          intervals.map((interval) => {
                            return (
                              <button style={styles.tab} onClick={() => fetchHistory(asset.id, interval)}>
                                <h6 style={styles.h6}>{interval}</h6>
                              </button>
                            )
                          })
                        }
                        </div>
                        <CanvasJSChart options = {options}
                        /* onRef = {ref => this.chart = ref} */
                        />
                      </div>
                    </>
                  )
                }
              </>
            );
          })}
        </tbody>
      </Table>

    </div>
  );
};

const styles = {
  div: {
      margin: '20px 0px',
      width: 0
  },
  tabParent: {
    margin: '15px 0px',
    display: 'flex',
    flex: 'auto',
    flexDirection: 'row',
    width: 0
  },
  tab: {
    background: '#c1c1c1',
    width: 'auto',
    padding: '5px 5px',
    borderRadius: 2,
    marginRight: 10,
  },
  h6: {
    padding: 0,
    margin: 0,
    color:'white',
    textTransform: 'capitalize',
    fontWeight: 'bolder',
    fontSize: 14,
  },
  changePercentColor: (asset) => Math.floor(asset.changePercent24Hr * 1) < 0 ? 'red' : 'green',
}
export default List;