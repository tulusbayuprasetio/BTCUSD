const chartContainer = document.getElementById('chart');
const chart = LightweightCharts.createChart(chartContainer, {
  layout: {
    background: { color: '#111' },
    textColor: '#DDD',
  },
  grid: {
    vertLines: { color: '#222' },
    horzLines: { color: '#222' },
  },
  timeScale: {
    borderColor: '#333',
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: '#333',
  },
});

const candleSeries = chart.addCandlestickSeries({
  upColor: '#0f0',
  downColor: '#f00',
  borderVisible: false,
  wickUpColor: '#0f0',
  wickDownColor: '#f00',
});

// Load default timeframe (M1)
loadData('m1');

document.getElementById('tf-select').addEventListener('change', (e) => {
  loadData(e.target.value);
});

function loadData(tf) {
  fetch(`${tf}.json`)
    .then(res => res.json())
    .then(data => {
      candleSeries.setData(data);
      autoDrawSupportResistance(data);
      drawTrendlines(data);
    });
}

function autoDrawSupportResistance(data) {
  const levels = findSupportResistance(data);
  levels.forEach(lvl => {
    chart.addHorizontalLine({
      price: lvl.price,
      color: lvl.type === 'support' ? '#00f' : '#ff0',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: lvl.type.toUpperCase(),
    });
  });
}

function drawTrendlines(data) {
  const highs = data.slice(-10).map(d => d.high);
  const lows = data.slice(-10).map(d => d.low);
  const startTime = data[data.length - 10].time;
  const endTime = data[data.length - 1].time;

  const highLine = [
    { time: startTime, value: highs[0] },
    { time: endTime, value: highs[highs.length - 1] },
  ];
  const lowLine = [
    { time: startTime, value: lows[0] },
    { time: endTime, value: lows[lows.length - 1] },
  ];

  const lineSeries = chart.addLineSeries({ color: '#0ff', lineWidth: 1 });
  lineSeries.setData(highLine);

  const lineSeries2 = chart.addLineSeries({ color: '#f0f', lineWidth: 1 });
  lineSeries2.setData(lowLine);
}

function findSupportResistance(data) {
  let levels = [];
  for (let i = 2; i < data.length - 2; i++) {
    let p = data[i];
    if (
      p.low < data[i - 1].low &&
      p.low < data[i + 1].low &&
      p.low < data[i - 2].low &&
      p.low < data[i + 2].low
    ) {
      levels.push({ price: p.low, type: 'support' });
    }
    if (
      p.high > data[i - 1].high &&
      p.high > data[i + 1].high &&
      p.high > data[i - 2].high &&
      p.high > data[i + 2].high
    ) {
      levels.push({ price: p.high, type: 'resistance' });
    }
  }
  return levels;
}