const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  layout: { background: { color: '#1e1e1e' }, textColor: '#d1d4dc' },
  priceScale: { position: 'right' },
  timeScale: { timeVisible: true },
});

const candleSeries = chart.addCandlestickSeries();
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    candleSeries.setData(data);
    analyzeTechnical(data);
  });

function analyzeTechnical(data) {
  const lastCandle = data[data.length - 1];
  const timeframe = detectTimeFrame(data); // M1 or H4 logic

  // Support / Resistance Example
  const levels = detectSNR(data);
  levels.forEach(level => {
    chart.addLineSeries({ color: level.type === 'resistance' ? 'red' : 'green', lineWidth: 1 })
      .setData([{ time: lastCandle.time, value: level.price }]);
  });

  // Comment based on strategy
  const strategy = timeframe === 'M1' ? 'Scalping' : 'Swing';
  alert(`Detected ${strategy} Strategy. ${levels.length} SNR levels plotted.`);
}

function detectSNR(data) {
  // Simple local top/bottom logic
  let levels = [];
  for (let i = 2; i < data.length - 2; i++) {
    const prev = data[i - 1], curr = data[i], next = data[i + 1];
    if (curr.high > prev.high && curr.high > next.high)
      levels.push({ price: curr.high, type: 'resistance' });
    if (curr.low < prev.low && curr.low < next.low)
      levels.push({ price: curr.low, type: 'support' });
  }
  return levels;
}

function detectTimeFrame(data) {
  const interval = data[1].time - data[0].time;
  if (interval < 300) return 'M1';
  if (interval > 10000) return 'H4';
  return 'Unknown';
}