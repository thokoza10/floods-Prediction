import { FloodRecord, BasinStation } from "../types";

export const MONITORING_STATIONS: BasinStation[] = [
  {
    id: "STN-MS-01",
    name: "New Orleans Delta Station",
    riverBasin: "Mississippi River Basin",
    region: "Louisiana, North America",
    country: "United States",
    lat: 29.9511,
    lng: -90.0715,
    dangerLevel_m: 5.2,
    majorFloodLevel_m: 6.5,
    currentWaterLevel: 4.85,
    currentRainfall_mm: 88.5,
    currentDischarge_m3s: 14500,
    currentSoilMoisture_pct: 79.4,
    status: "Watch",
    riskScore: 0.68,
  },
  {
    id: "STN-BG-02",
    name: "Sirajganj Hydro Sensor",
    riverBasin: "Brahmaputra-Jamuna Basin",
    region: "Rajshahi Division",
    country: "Bangladesh",
    lat: 24.4534,
    lng: 89.7008,
    dangerLevel_m: 13.35,
    majorFloodLevel_m: 15.0,
    currentWaterLevel: 14.1,
    currentRainfall_mm: 165.2,
    currentDischarge_m3s: 52000,
    currentSoilMoisture_pct: 94.2,
    status: "Critical",
    riskScore: 0.92,
  },
  {
    id: "STN-RH-03",
    name: "Cologne Gauging Station",
    riverBasin: "Rhine River Basin",
    region: "North Rhine-Westphalia",
    country: "Germany",
    lat: 50.9375,
    lng: 6.9603,
    dangerLevel_m: 8.3,
    majorFloodLevel_m: 10.0,
    currentWaterLevel: 6.4,
    currentRainfall_mm: 42.0,
    currentDischarge_m3s: 3800,
    currentSoilMoisture_pct: 61.5,
    status: "Normal",
    riskScore: 0.28,
  },
  {
    id: "STN-YZ-04",
    name: "Wuhan Yangtze Hydrometry",
    riverBasin: "Yangtze River Basin",
    region: "Hubei Province",
    country: "China",
    lat: 30.5928,
    lng: 114.3055,
    dangerLevel_m: 27.3,
    majorFloodLevel_m: 29.73,
    currentWaterLevel: 26.8,
    currentRainfall_mm: 112.4,
    currentDischarge_m3s: 48500,
    currentSoilMoisture_pct: 86.0,
    status: "Warning",
    riskScore: 0.74,
  },
  {
    id: "STN-ZB-05",
    name: "Victoria Falls / Kariba Sensor",
    riverBasin: "Zambezi River Basin",
    region: "Matabeleland North",
    country: "Zimbabwe / Zambia",
    lat: -17.9243,
    lng: 25.8572,
    dangerLevel_m: 6.8,
    majorFloodLevel_m: 8.2,
    currentWaterLevel: 5.1,
    currentRainfall_mm: 55.0,
    currentDischarge_m3s: 2900,
    currentSoilMoisture_pct: 68.0,
    status: "Normal",
    riskScore: 0.35,
  },
  {
    id: "STN-IN-06",
    name: "Sukkur Barrage Gauge",
    riverBasin: "Indus River Basin",
    region: "Sindh Province",
    country: "Pakistan",
    lat: 27.7052,
    lng: 68.8574,
    dangerLevel_m: 7.5,
    majorFloodLevel_m: 9.0,
    currentWaterLevel: 7.9,
    currentRainfall_mm: 145.0,
    currentDischarge_m3s: 21500,
    currentSoilMoisture_pct: 91.0,
    status: "Critical",
    riskScore: 0.89,
  },
  {
    id: "STN-AM-07",
    name: "Manaus Rio Negro Basin",
    riverBasin: "Amazon River Basin",
    region: "Amazonas State",
    country: "Brazil",
    lat: -3.119,
    lng: -60.0217,
    dangerLevel_m: 29.0,
    majorFloodLevel_m: 30.0,
    currentWaterLevel: 28.1,
    currentRainfall_mm: 95.0,
    currentDischarge_m3s: 175000,
    currentSoilMoisture_pct: 82.0,
    status: "Watch",
    riskScore: 0.55,
  },
  {
    id: "STN-TH-08",
    name: "Thames Barrier Sensor",
    riverBasin: "Thames Estuary",
    region: "Greater London",
    country: "United Kingdom",
    lat: 51.4975,
    lng: 0.0375,
    dangerLevel_m: 4.8,
    majorFloodLevel_m: 5.5,
    currentWaterLevel: 3.2,
    currentRainfall_mm: 28.0,
    currentDischarge_m3s: 140,
    currentSoilMoisture_pct: 54.0,
    status: "Normal",
    riskScore: 0.18,
  },
];

// Generate comprehensive dataset with historical dates from 2018 up to Aug 2026
function generateHistoricalFloodDataset(): FloodRecord[] {
  const records: FloodRecord[] = [];
  let idCounter = 1;

  // Base dates spanning from Jan 2018 to August 2026
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const months = [
    { m: "01", name: "Jan", seasonFactor: 0.3 },
    { m: "02", name: "Feb", seasonFactor: 0.4 },
    { m: "03", name: "Mar", seasonFactor: 0.5 },
    { m: "04", name: "Apr", seasonFactor: 0.7 },
    { m: "05", name: "May", seasonFactor: 0.8 },
    { m: "06", name: "Jun", seasonFactor: 1.3 }, // Monsoon peak
    { m: "07", name: "Jul", seasonFactor: 1.5 }, // Peak flood season
    { m: "08", name: "Aug", seasonFactor: 1.4 },
    { m: "09", name: "Sep", seasonFactor: 1.1 },
    { m: "10", name: "Oct", seasonFactor: 0.7 },
    { m: "11", name: "Nov", seasonFactor: 0.4 },
    { m: "12", name: "Dec", seasonFactor: 0.3 },
  ];

  MONITORING_STATIONS.forEach((stn, stnIdx) => {
    years.forEach((year) => {
      months.forEach((mo) => {
        // Skip future dates after Aug 2026
        if (year === 2026 && parseInt(mo.m) > 8) return;

        // Generate 2 sample days per month for rich temporal resolution
        [5, 20].forEach((day) => {
          const dateStr = `${year}-${mo.m}-${day.toString().padStart(2, "0")}`;
          
          // Seeded pseudo-randomness for deterministic reproducible physical dynamics
          const pseudoHash = Math.sin(year * 37 + parseInt(mo.m) * 19 + day * 11 + stnIdx * 73);
          const noise = (pseudoHash - Math.floor(pseudoHash));
          const noise2 = Math.cos(year * 17 + parseInt(mo.m) * 31 + day * 23 + stnIdx * 41);
          const normNoise2 = Math.abs(noise2);

          // Physical parameters based on season and basin climate
          const monsoonIntensity = Math.min(10, Math.max(0.5, +(mo.seasonFactor * 5.0 + noise * 4.0).toFixed(1)));
          const topographyDrainage = Math.min(10, Math.max(1.0, +(4.5 + (stnIdx % 4) * 1.5 - noise * 1.5).toFixed(1)));
          const deforestationIndex = Math.min(10, Math.max(1.0, +(4.0 + (year - 2018) * 0.4 + noise * 1.2).toFixed(1)));
          const urbanizationIndex = Math.min(10, Math.max(2.0, +(5.0 + (year - 2018) * 0.35 + normNoise2 * 1.5).toFixed(1)));
          const climateChangeFactor = Math.min(10, Math.max(2.0, +(5.5 + (year - 2018) * 0.5 + noise * 1.0).toFixed(1)));
          const siltationLevel = Math.min(10, Math.max(1.0, +(3.5 + deforestationIndex * 0.4 + noise * 1.5).toFixed(1)));
          
          // Rainfall mm (0 - 350 mm)
          const rainfall_mm = Math.max(2.0, +((monsoonIntensity * 22.0) + (noise * 80.0) + (mo.seasonFactor > 1.0 ? 50 : 0)).toFixed(1));
          
          // Soil Moisture (30% - 99%)
          const soilMoisture_pct = Math.min(99.5, Math.max(30.0, +(40.0 + (monsoonIntensity * 4.5) + (rainfall_mm * 0.15) + noise * 10).toFixed(1)));
          
          // Dam storage
          const damsStorage_pct = Math.min(98.0, Math.max(25.0, +(50.0 + mo.seasonFactor * 25 + (rainfall_mm * 0.1) + noise * 8).toFixed(1)));

          // Water level relative to baseline
          const baseWater = stn.dangerLevel_m * 0.65;
          const waterLevel_m = +(baseWater + (rainfall_mm / 100) * (stn.dangerLevel_m * 0.45) + (soilMoisture_pct / 100) * (stn.dangerLevel_m * 0.3) * (10 / topographyDrainage) * 0.5).toFixed(2);

          // Discharge
          const baseDischarge = stn.currentDischarge_m3s * 0.6;
          const riverDischarge_m3s = Math.round(baseDischarge * (waterLevel_m / stn.dangerLevel_m) * (1 + (rainfall_mm / 200)));

          // Elevation
          const elevation_m = Math.round(15 + stnIdx * 35 + normNoise2 * 20);

          // Target Hydrological Probability Formula (Kaggle dataset benchmark correlation)
          const linearCombination = 
            0.26 * (monsoonIntensity / 10) +
            0.24 * (rainfall_mm / 250) +
            0.18 * (soilMoisture_pct / 100) +
            0.12 * (damsStorage_pct / 100) +
            0.10 * (1 - topographyDrainage / 10) +
            0.08 * (deforestationIndex / 10) +
            0.07 * (siltationLevel / 10) +
            0.06 * (climateChangeFactor / 10) +
            (noise - 0.5) * 0.1;

          // Sigmoid activation
          const sigmoid = 1 / (1 + Math.exp(-((linearCombination - 0.46) * 7.5)));
          const inundationProbability = Math.min(0.99, Math.max(0.01, +sigmoid.toFixed(3)));

          const floodOccurred = inundationProbability >= 0.50 ? 1 : 0;

          let alertLevel: "Normal" | "Watch" | "Warning" | "Severe" = "Normal";
          if (inundationProbability >= 0.80) alertLevel = "Severe";
          else if (inundationProbability >= 0.60) alertLevel = "Warning";
          else if (inundationProbability >= 0.40) alertLevel = "Watch";

          records.push({
            id: idCounter++,
            date: dateStr,
            stationId: stn.id,
            stationName: stn.name,
            riverBasin: stn.riverBasin,
            region: stn.region,
            country: stn.country,
            lat: stn.lat,
            lng: stn.lng,
            monsoonIntensity,
            topographyDrainage,
            riverDischarge_m3s,
            waterLevel_m,
            soilMoisture_pct,
            rainfall_mm,
            deforestationIndex,
            urbanizationIndex,
            climateChangeFactor,
            elevation_m,
            damsStorage_pct,
            siltationLevel,
            inundationProbability,
            floodOccurred,
            alertLevel,
          });
        });
      });
    });
  });

  return records;
}

export const HISTORICAL_DATASET = generateHistoricalFloodDataset();

// 7-day Future Forecast generator for a selected station
export function generateFuture7DayForecast(station: BasinStation): Array<{
  date: string;
  dayName: string;
  predictedRainfall_mm: number;
  predictedDischarge_m3s: number;
  predictedWaterLevel_m: number;
  floodProbability: number;
  upperConfidence: number;
  lowerConfidence: number;
  status: "Safe" | "Elevated" | "Warning" | "Extreme Danger";
}> {
  const days = ["Today", "+1 Day", "+2 Days", "+3 Days", "+4 Days", "+5 Days", "+6 Days"];
  const baseDate = new Date();
  
  return days.map((dayName, index) => {
    const fDate = new Date(baseDate);
    fDate.setDate(fDate.getDate() + index);
    const dateString = fDate.toISOString().split("T")[0];

    // Simulated meteorology trajectory
    const weatherWave = Math.sin(index * 0.8 + station.riskScore * 3);
    const rain = Math.max(5, Math.round(station.currentRainfall_mm * (1 + weatherWave * 0.45)));
    const water = +(station.currentWaterLevel * (1 + weatherWave * 0.22)).toFixed(2);
    const discharge = Math.round(station.currentDischarge_m3s * (1 + weatherWave * 0.3));

    const prob = Math.min(0.98, Math.max(0.05, +(station.riskScore + weatherWave * 0.18).toFixed(2)));
    const upper = Math.min(0.99, +(prob + 0.08).toFixed(2));
    const lower = Math.max(0.01, +(prob - 0.08).toFixed(2));

    let status: "Safe" | "Elevated" | "Warning" | "Extreme Danger" = "Safe";
    if (prob >= 0.8) status = "Extreme Danger";
    else if (prob >= 0.6) status = "Warning";
    else if (prob >= 0.4) status = "Elevated";

    return {
      date: dateString,
      dayName,
      predictedRainfall_mm: rain,
      predictedDischarge_m3s: discharge,
      predictedWaterLevel_m: water,
      floodProbability: prob,
      upperConfidence: upper,
      lowerConfidence: lower,
      status,
    };
  });
}
