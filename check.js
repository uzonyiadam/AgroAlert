const axios = require("axios");

const LOCATIONS = [
  { name: "Field 1", lat: 47.4180, lon: 19.7269 }
];

async function getWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_sum,et0_fao_evapotranspiration` +
    `&forecast_days=7&past_days=3`;

  const res = await axios.get(url);
  return res.data;
}

function analyze(data) {
  const rain = (data.daily?.precipitation_sum || []).reduce((a,b)=>a+(b||0),0);
  const et0 = (data.daily?.et0_fao_evapotranspiration || []).reduce((a,b)=>a+(b||0),0);

  const drought = (et0 - rain) * 6 + 40;

  let status = "OK";
  let irr = 0;

  if (drought > 70) { status = "CRITICAL"; irr = 20; }
  else if (drought > 50) { status = "HIGH"; irr = 12; }
  else if (drought > 35) { status = "WARNING"; irr = 6; }

  return { drought, status, irr };
}

(async () => {
  for (const loc of LOCATIONS) {
    const data = await getWeather(loc.lat, loc.lon);
    const result = analyze(data);

    console.log(`🌾 ${loc.name}`);
    console.log(`Status: ${result.status}`);
    console.log(`Drought: ${result.drought.toFixed(1)}`);
    console.log(`Irrigation: ${result.irr} mm`);
    console.log("------------------");
  }
})();
