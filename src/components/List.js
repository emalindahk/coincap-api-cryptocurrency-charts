import React, { useState, useEffect } from 'react';
import { Table } from 'reactstrap';
import * as d3 from "d3";
import { XAxis, YAxis, YGrid, Line } from "./chartComponent.js";


const List = (props) => {
  const [state, setState] = useState({
    rowID: null,
    clicked: false,
    history: [{
      date: new Date(new Date().getTime() * 1000 - 2),
      value: 28979.000
    },{
      date: new Date(new Date().getTime() * 1000 - 2),
      value: 28979.000
    }],
    loadingHistory: false,
    body_width: document.body.clientWidth
  })

  useEffect(() => {
    window.addEventListener("resize", resize());
  },[state.history])
  console.log("STATE", state.history)

  const resize = () =>{
    let t;

    return event => {
      if (t !== false) {
        clearTimeout(t);
      }
      t = setTimeout(() => {
        setState(prev=>({
          ...prev,
          body_width: document.body.clientWidth
        }));
      }, 100);
    };
  }

  const updateScale = _ => {
    const data = state.history;
    console.log('UPDATE SCALE', data)
    const xScale = d3.scaleTime();
    const yScale = d3.scaleLinear().nice();

    const xDomain = d3.extent(data, d => d.date);
    const yDomain = [0, d3.max(data, d => d.value)];
    console.log('YDOMAIN', yDomain)
    xScale
      .domain(xDomain)
      .range([0, state.body_width - (40 + 20)]);


    yScale
      .domain(yDomain)
      .range([430 - (20 + 20), 0]);

    return { xScale, yScale }
  }

  const updatePlotSize = _ => {
    const plotWidth =
      state.body_width - (40 + 20);
    const plotHeight =
      430 - (20 + 20);

    return { plotWidth, plotHeight }


  }


  const { xScale, yScale } = updateScale();

  const { plotWidth, plotHeight } = updatePlotSize();

  const metaData = {
    xScale: xScale,
    yScale: yScale,
    plotWidth: plotWidth,
    plotHeight: plotHeight,
    xSlide: -xScale(state.history[1].date)
  };
  const plotData = {
    plotData: state.history.map((d, i) => {
      return {
        id: i,
        data: d,
        x: xScale(d.date),
        y: yScale(d.value)
      };
    })
  };

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
        const finalData = data.data.map(data=>({
          date: new Date(data.time),
          value: Math.floor(data.priceUsd * 1)
        }))
        setState(prev=>({
          ...prev,
          loadingHistory: true,
          history: finalData
        }))
      });
  }

  const intervals = ['m1', 'm5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1']
  const { assets } = props;
  console.log(assets)
  const fallbackUrl = 'https://img.icons8.com/color/50/000000/average-2.png';
  return (
    <div style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}>
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
                  ...prev,
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
                        <svg width={state.body_width} height={430}>
                          <g
                            className="axisLaeyr"
                            width={plotWidth}
                            height={plotHeight}
                            transform={`translate(${40}, ${20})`}
                          >
                            <YGrid {...metaData} />
                            <XAxis {...metaData} transform={`translate(0,${plotHeight})`} />
                            <YAxis {...metaData} />
                          </g>
                          <g
                            className="plotLayer"
                            width={plotWidth}
                            height={plotHeight}
                            transform={`translate(${40}, ${20})`}
                          >
                            <Line {...metaData} {...plotData} />
                          </g>
                        </svg>
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
    color: 'white',
    textTransform: 'capitalize',
    fontWeight: 'bolder',
    fontSize: 14,
  },
  changePercentColor: (asset) => Math.floor(asset.changePercent24Hr * 1) < 0 ? 'red' : 'green',
}
export default List;