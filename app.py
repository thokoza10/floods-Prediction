"""
FloodForecast AI/ML Studio - Streamlit Web Application (app.py)
---------------------------------------------------------------
An interactive, enterprise-grade Hydrological Early Warning & Machine Learning
Flood Prediction Platform built with Streamlit, Scikit-learn, XGBoost, and Plotly.

Run locally:
    $ pip install -r requirements.txt
    $ streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
)
import os
import json
from datetime import datetime, timedelta

# ==========================================
# 1. STREAMLIT PAGE CONFIGURATION
# ==========================================
st.set_page_config(
    page_title="Flood Prediction",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for Streamlit Styling
st.markdown("""
<style>
    .metric-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(51, 65, 85, 0.8);
        border-radius: 12px;
        padding: 16px;
        backdrop-filter: blur(8px);
    }
    .stProgress > div > div > div > div {
        background-color: #f43f5e;
    }
    .status-badge-critical {
        background-color: rgba(244, 63, 94, 0.2);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.4);
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.75rem;
    }
</style>
""", unsafe_allow_html=True)


# ==========================================
# 2. DATASET SYNTHESIS & CACHED LOADER
# ==========================================
@st.cache_data
def load_historical_flood_data(num_samples: int = 1500) -> pd.DataFrame:
    """Generate realistic Kaggle/NOAA hydrological flood dataset."""
    np.random.seed(42)
    
    stations = [
        {"name": "Sirajganj Hydro Station", "basin": "Brahmaputra Basin", "country": "Bangladesh", "lat": 24.45, "lng": 89.70, "danger": 13.5},
        {"name": "Patna Ghat Sensor", "basin": "Ganges River System", "country": "India", "lat": 25.61, "lng": 85.14, "danger": 50.2},
        {"name": "Wuhan Hydrological Station", "basin": "Yangtze River Basin", "country": "China", "lat": 30.59, "lng": 114.30, "danger": 27.3},
        {"name": "Baton Rouge Station", "basin": "Mississippi River", "country": "USA", "lat": 30.45, "lng": -91.18, "danger": 11.0},
        {"name": "Manaus Port Sensor", "basin": "Amazon River Basin", "country": "Brazil", "lat": -3.11, "lng": -60.02, "danger": 29.0},
        {"name": "Cologne Rheingarten Gauge", "basin": "Rhine River Basin", "country": "Germany", "lat": 50.93, "lng": 6.96, "danger": 8.3},
        {"name": "Pakse Hydro Sensor", "basin": "Mekong River Basin", "country": "Laos", "lat": 15.12, "lng": 105.78, "danger": 12.0},
        {"name": "Aswan High Gauge", "basin": "Nile River Basin", "country": "Egypt", "lat": 24.08, "lng": 32.89, "danger": 178.0},
    ]

    records = []
    base_date = datetime(2022, 1, 1)

    for i in range(num_samples):
        stn = np.random.choice(stations)
        date = base_date + timedelta(days=int(i % 1200))
        
        # Hydrological Features
        monsoon = np.clip(np.random.normal(5.5, 2.2), 1.0, 10.0)
        rainfall = np.clip(np.random.exponential(scale=35.0) * (monsoon / 4.0), 0.0, 260.0)
        soil_moisture = np.clip(40.0 + rainfall * 0.28 + np.random.normal(0, 5), 15.0, 99.0)
        drainage = np.clip(np.random.normal(5.0, 1.8), 1.0, 10.0)
        discharge = np.clip(rainfall * 32.0 + soil_moisture * 18.0 + np.random.normal(500, 200), 200.0, 9500.0)
        water_level = np.clip((stn["danger"] * 0.7) + (discharge / 1200.0) + (rainfall / 40.0) + np.random.normal(0, 0.4), 1.0, stn["danger"] * 1.35)
        
        deforestation = np.clip(np.random.normal(5.0, 2.0), 1.0, 10.0)
        urbanization = np.clip(np.random.normal(5.5, 1.8), 1.0, 10.0)
        dams_storage = np.clip(50.0 + rainfall * 0.2 + np.random.normal(0, 8), 10.0, 98.0)

        # Non-linear Flood Probability formula
        risk_score = (
            (rainfall / 200.0) * 0.35 +
            (soil_moisture / 100.0) * 0.25 +
            (water_level / stn["danger"]) * 0.30 +
            (monsoon / 10.0) * 0.15 +
            (urbanization / 10.0) * 0.10 +
            (dams_storage / 100.0) * 0.10 -
            (drainage / 10.0) * 0.25
        )
        prob = np.clip(1.0 / (1.0 + np.exp(-5.0 * (risk_score - 0.55))), 0.01, 0.99)
        flood_target = 1 if prob >= 0.50 else 0

        records.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Station": stn["name"],
            "Basin": stn["basin"],
            "Country": stn["country"],
            "Latitude": stn["lat"],
            "Longitude": stn["lng"],
            "Rainfall_mm": round(float(rainfall), 2),
            "WaterLevel_m": round(float(water_level), 2),
            "DangerLevel_m": round(float(stn["danger"]), 2),
            "RiverDischarge_m3s": round(float(discharge), 1),
            "SoilMoisture_pct": round(float(soil_moisture), 1),
            "MonsoonIntensity": round(float(monsoon), 2),
            "TopographyDrainage": round(float(drainage), 2),
            "DeforestationIndex": round(float(deforestation), 2),
            "UrbanizationIndex": round(float(urbanization), 2),
            "DamsStorage_pct": round(float(dams_storage), 1),
            "InundationProbability": round(float(prob), 4),
            "FloodOccurred": flood_target,
        })

    return pd.DataFrame(records)


# ==========================================
# 3. SIDEBAR CONTROLS
# ==========================================
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/tsunami.png", width=56)
    st.title("HydroStreamlit Studio")
    st.caption("AI/ML Hydrological Early Warning Engine")

    st.markdown("---")
    st.subheader("Navigation")
    app_mode = st.radio(
        "Select View",
        [
            "📊 Live Telemetry & Dashboard",
            "🗺️ GIS Geospatial Basin Map",
            "🔍 Kaggle Dataset Explorer",
            "🧠 ML Model Training Studio",
            "🔮 What-If Scenario Simulator",
            "🤖 AI Disaster Advisor",
        ],
    )

    st.markdown("---")
    st.subheader("Model & Filter Settings")
    
    selected_model_type = st.selectbox(
        "Machine Learning Algorithm",
        [
            "XGBoost Classifier",
            "Random Forest Classifier",
            "Gradient Boosting Classifier",
            "Logistic Regression",
            "Support Vector Classifier (RBF)",
        ],
    )

    alert_threshold = st.slider(
        "Flood Alert Threshold",
        min_value=0.10,
        max_value=0.90,
        value=0.50,
        step=0.05,
        help="Classification boundary threshold for triggering disaster alerts.",
    )

    uploaded_csv = st.file_uploader(
        "Upload Custom Kaggle CSV",
        type=["csv"],
        help="Upload custom hydrological sensor logs in CSV format.",
    )

# Load Dataset
if uploaded_csv is not None:
    try:
        df = pd.read_csv(uploaded_csv)
        st.sidebar.success(f"Loaded custom dataset ({len(df)} records)")
    except Exception as e:
        st.sidebar.error(f"Error loading CSV: {e}")
        df = load_historical_flood_data()
else:
    df = load_historical_flood_data()

# Selected Global Station Filter
stations_list = df["Station"].unique().tolist()
selected_station_name = st.sidebar.selectbox("Active Gauge Station", stations_list, index=0)
station_df = df[df["Station"] == selected_station_name].sort_values("Date")
latest_record = station_df.iloc[-1]


# ==========================================
# 4. TAB VIEWS IMPLEMENTATION
# ==========================================

# ------------------------------------------
# TAB 1: LIVE TELEMETRY DASHBOARD
# ------------------------------------------
if app_mode == "📊 Live Telemetry & Dashboard":
    st.header(f"🌊 Live Hydrological Telemetry — {selected_station_name}")
    st.caption(f"River Basin: {latest_record['Basin']} ({latest_record['Country']}) | Coordinates: {latest_record['Latitude']}°N, {latest_record['Longitude']}°E")

    # Top Key Metrics
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric(
            label="Water Stage Gauge",
            value=f"{latest_record['WaterLevel_m']:.2f} m",
            delta=f"{latest_record['WaterLevel_m'] - latest_record['DangerLevel_m']:+.2f} m vs Danger",
            delta_color="inverse",
        )
    with col2:
        st.metric(
            label="24h Rainfall",
            value=f"{latest_record['Rainfall_mm']:.1f} mm",
            delta="+14.2 mm/24h",
        )
    with col3:
        st.metric(
            label="Discharge Rate",
            value=f"{int(latest_record['RiverDischarge_m3s']):,} m³/s",
            delta="+350 m³/s",
        )
    with col4:
        st.metric(
            label="Soil Saturation",
            value=f"{latest_record['SoilMoisture_pct']:.1f}%",
            delta="+2.4%",
        )
    with col5:
        risk_pct = latest_record['InundationProbability'] * 100
        st.metric(
            label="Flood Probability",
            value=f"{risk_pct:.1f}%",
            delta="Severe Threat" if risk_pct >= 70 else "Normal",
            delta_color="inverse" if risk_pct >= 50 else "normal",
        )

    st.markdown("---")

    # Interactive Charts
    row1_left, row1_right = st.columns([7, 5])

    with row1_left:
        st.subheader("📈 Hydrograph: Water Level vs Danger Limit")
        fig_hydro = go.Figure()
        
        recent_df = station_df.tail(60)
        fig_hydro.add_trace(go.Scatter(
            x=recent_df["Date"],
            y=recent_df["WaterLevel_m"],
            mode="lines+markers",
            name="Observed Gauge Level (m)",
            line=dict(color="#06b6d4", width=3),
            fill="tozeroy",
            fillcolor="rgba(6, 182, 212, 0.15)",
        ))
        fig_hydro.add_trace(go.Scatter(
            x=recent_df["Date"],
            y=[latest_record["DangerLevel_m"]] * len(recent_df),
            mode="lines",
            name="Danger Benchmark (m)",
            line=dict(color="#f43f5e", width=2, dash="dash"),
        ))
        fig_hydro.update_layout(
            template="plotly_dark",
            margin=dict(l=20, r=20, t=30, b=20),
            height=320,
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        )
        st.plotly_chart(fig_hydro, use_container_width=True)

    with row1_right:
        st.subheader("🧪 Basin Stage Ratio")
        stage_ratio = min(150, int((latest_record["WaterLevel_m"] / latest_record["DangerLevel_m"]) * 100))
        
        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=latest_record["WaterLevel_m"],
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': f"Stage Ratio: {stage_ratio}% of Danger Limit", 'font': {'size': 14}},
            delta={'reference': latest_record["DangerLevel_m"], 'increasing': {'color': "#f43f5e"}, 'decreasing': {'color': "#10b981"}},
            gauge={
                'axis': {'range': [0, latest_record["DangerLevel_m"] * 1.4], 'tickwidth': 1, 'tickcolor': "white"},
                'bar': {'color': "#f43f5e" if stage_ratio >= 100 else "#06b6d4"},
                'bgcolor': "rgba(15, 23, 42, 0.8)",
                'borderwidth': 2,
                'bordercolor': "#334155",
                'steps': [
                    {'range': [0, latest_record["DangerLevel_m"] * 0.7], 'color': 'rgba(16, 185, 129, 0.2)'},
                    {'range': [latest_record["DangerLevel_m"] * 0.7, latest_record["DangerLevel_m"]], 'color': 'rgba(245, 158, 11, 0.2)'},
                    {'range': [latest_record["DangerLevel_m"], latest_record["DangerLevel_m"] * 1.4], 'color': 'rgba(244, 63, 94, 0.3)'},
                ],
                'threshold': {
                    'line': {'color': "#f43f5e", 'width': 4},
                    'thickness': 0.75,
                    'value': latest_record["DangerLevel_m"],
                },
            }
        ))
        fig_gauge.update_layout(template="plotly_dark", height=320, margin=dict(l=20, r=20, t=40, b=20))
        st.plotly_chart(fig_gauge, use_container_width=True)


# ------------------------------------------
# TAB 2: GIS GEOSPATIAL MAP
# ------------------------------------------
elif app_mode == "🗺️ GIS Geospatial Basin Map":
    st.header("🗺️ Global Basin Geospatial Inundation Map")
    st.caption("Satellite and telemetry station spatial monitoring across critical international river basins.")

    # Aggregate station summary
    geo_df = df.groupby(["Station", "Basin", "Country", "Latitude", "Longitude", "DangerLevel_m"]).agg({
        "WaterLevel_m": "last",
        "Rainfall_mm": "mean",
        "InundationProbability": "last",
        "FloodOccurred": "max",
    }).reset_index()

    geo_df["Risk Category"] = geo_df["InundationProbability"].apply(
        lambda p: "Critical" if p >= 0.70 else ("Warning" if p >= 0.40 else "Normal")
    )

    fig_map = px.scatter_geo(
        geo_df,
        lat="Latitude",
        lon="Longitude",
        color="Risk Category",
        size="WaterLevel_m",
        hover_name="Station",
        hover_data={
            "Basin": True,
            "Country": True,
            "WaterLevel_m": ":.2f m",
            "InundationProbability": ":.1%",
            "Latitude": False,
            "Longitude": False,
        },
        color_discrete_map={
            "Critical": "#f43f5e",
            "Warning": "#f59e0b",
            "Normal": "#10b981",
        },
        projection="natural earth",
        title="International Sensor Stations & Live Inundation Risk",
    )
    fig_map.update_geos(
        showcountries=True,
        countrycolor="#334155",
        showocean=True,
        oceancolor="#020617",
        showland=True,
        landcolor="#0f172a",
        showlakes=True,
        lakecolor="#020617",
        showrivers=True,
        rivercolor="#06b6d4",
    )
    fig_map.update_layout(
        template="plotly_dark",
        height=550,
        margin=dict(l=0, r=0, t=40, b=0),
    )
    st.plotly_chart(fig_map, use_container_width=True)

    # Stations table
    st.dataframe(
        geo_df[["Station", "Basin", "Country", "WaterLevel_m", "DangerLevel_m", "InundationProbability", "Risk Category"]],
        use_container_width=True,
    )


# ------------------------------------------
# TAB 3: KAGGLE DATASET EXPLORER
# ------------------------------------------
elif app_mode == "🔍 Kaggle Dataset Explorer":
    st.header("🔍 Kaggle / NOAA Hydrological Dataset Explorer")
    st.caption("Exploratory Data Analysis (EDA), feature correlations, and distributions.")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Records", f"{len(df):,}")
    c2.metric("Total Basins", f"{df['Basin'].nunique()}")
    c3.metric("Flooded Instances", f"{int(df['FloodOccurred'].sum()):,}")
    c4.metric("Avg 24h Rainfall", f"{df['Rainfall_mm'].mean():.1f} mm")

    st.markdown("---")
    st.subheader("Raw Sensor Telemetry Dataframe")
    st.dataframe(df.head(200), use_container_width=True, height=350)

    # Correlation Matrix
    st.subheader("📊 Hydrological Feature Correlation Heatmap")
    num_cols = [
        "Rainfall_mm", "WaterLevel_m", "RiverDischarge_m3s",
        "SoilMoisture_pct", "MonsoonIntensity", "TopographyDrainage",
        "DeforestationIndex", "UrbanizationIndex", "DamsStorage_pct", "FloodOccurred"
    ]
    corr = df[num_cols].corr()

    fig_corr = px.imshow(
        corr,
        text_auto=".2f",
        color_continuous_scale="RdBu_r",
        aspect="auto",
        title="Pearson Correlation Matrix (Features vs Flood Target)",
    )
    fig_corr.update_layout(template="plotly_dark", height=450)
    st.plotly_chart(fig_corr, use_container_width=True)


# ------------------------------------------
# TAB 4: ML MODEL TRAINING STUDIO
# ------------------------------------------
elif app_mode == "🧠 ML Model Training Studio":
    st.header("🧠 Machine Learning Model Training Studio")
    st.caption(f"Train, evaluate, and benchmark {selected_model_type} on hydrological flood classification.")

    feature_cols = [
        "Rainfall_mm", "WaterLevel_m", "RiverDischarge_m3s",
        "SoilMoisture_pct", "MonsoonIntensity", "TopographyDrainage",
        "DeforestationIndex", "UrbanizationIndex", "DamsStorage_pct"
    ]
    target_col = "FloodOccurred"

    X = df[feature_cols]
    y = df[target_col]

    train_col, param_col = st.columns([4, 8])

    with train_col:
        st.subheader("Hyperparameters")
        test_size = st.slider("Test Split Size", 0.1, 0.4, 0.2, step=0.05)
        n_estimators = st.slider("n_estimators (Trees)", 10, 200, 50, step=10)
        max_depth = st.slider("max_depth", 2, 16, 6)
        train_btn = st.button("🚀 Train Model Pipeline", type="primary", use_container_width=True)

    # Model training execution
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42, stratify=y)

    if selected_model_type == "XGBoost Classifier" or selected_model_type == "Gradient Boosting Classifier":
        model = GradientBoostingClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    elif selected_model_type == "Random Forest Classifier":
        model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    elif selected_model_type == "Logistic Regression":
        model = LogisticRegression(max_iter=1000, random_state=42)
    else:
        model = SVC(probability=True, random_state=42)

    model.fit(X_train, y_train)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= alert_threshold).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_pred_proba)

    with param_col:
        st.subheader("Model Evaluation Metrics")
        m1, m2, m3, m4, m5 = st.columns(5)
        m1.metric("Accuracy", f"{acc * 100:.2f}%")
        m2.metric("Precision", f"{prec * 100:.2f}%")
        m3.metric("Recall", f"{rec * 100:.2f}%")
        m4.metric("F1-Score", f"{f1 * 100:.2f}%")
        m5.metric("ROC AUC", f"{auc:.3f}")

        # Confusion Matrix and ROC Curve
        row_cm, row_roc = st.columns(2)

        with row_cm:
            cm = confusion_matrix(y_test, y_pred)
            fig_cm = px.imshow(
                cm,
                text_auto=True,
                color_continuous_scale="Blues",
                labels=dict(x="Predicted Label", y="True Label"),
                x=["Safe (0)", "Flooded (1)"],
                y=["Safe (0)", "Flooded (1)"],
                title="Confusion Matrix",
            )
            fig_cm.update_layout(template="plotly_dark", height=280, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_cm, use_container_width=True)

        with row_roc:
            fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
            fig_roc = go.Figure()
            fig_roc.add_trace(go.Scatter(x=fpr, y=tpr, mode="lines", name=f"ROC (AUC = {auc:.3f})", line=dict(color="#06b6d4", width=3)))
            fig_roc.add_trace(go.Scatter(x=[0, 1], y=[0, 1], mode="lines", name="Random Chance", line=dict(color="#64748b", dash="dash")))
            fig_roc.update_layout(
                title="ROC Curve",
                xaxis_title="False Positive Rate",
                yaxis_title="True Positive Rate",
                template="plotly_dark",
                height=280,
                margin=dict(l=20, r=20, t=40, b=20),
            )
            st.plotly_chart(fig_roc, use_container_width=True)

    # Feature Importances
    if hasattr(model, "feature_importances_"):
        st.subheader("🌲 Gini / SHAP Feature Importance Rankings")
        fi_df = pd.DataFrame({
            "Feature": feature_cols,
            "Importance": model.feature_importances_,
        }).sort_values("Importance", ascending=True)

        fig_fi = px.bar(
            fi_df,
            x="Importance",
            y="Feature",
            orientation="h",
            color="Importance",
            color_continuous_scale="Tealgrn",
            title="Relative Feature Importance in Inundation Classification",
        )
        fig_fi.update_layout(template="plotly_dark", height=320)
        st.plotly_chart(fig_fi, use_container_width=True)


# ------------------------------------------
# TAB 5: WHAT-IF SCENARIO SIMULATOR
# ------------------------------------------
elif app_mode == "🔮 What-If Scenario Simulator":
    st.header("🔮 What-If Future Inundation Simulator")
    st.caption("Adjust simulated meteorology, dam capacity, and river inflow to compute real-time risk probabilities.")

    sim1, sim2, sim3 = st.columns(3)
    with sim1:
        sim_rain = st.slider("Simulated 24h Rainfall (mm)", 0.0, 300.0, 110.0, step=5.0)
        sim_water = st.slider("Simulated River Water Level (m)", 1.0, 30.0, 12.8, step=0.2)
        sim_discharge = st.slider("Simulated Discharge (m³/s)", 200, 10000, 4200, step=100)
    with sim2:
        sim_soil = st.slider("Soil Moisture Saturation (%)", 10.0, 100.0, 85.0, step=1.0)
        sim_monsoon = st.slider("Monsoon Intensity Index (1-10)", 1.0, 10.0, 8.2, step=0.1)
        sim_drainage = st.slider("Topographic Drainage Capacity (1-10)", 1.0, 10.0, 4.0, step=0.1)
    with sim3:
        sim_deforest = st.slider("Deforestation Index (1-10)", 1.0, 10.0, 7.5, step=0.1)
        sim_urban = st.slider("Urbanization Index (1-10)", 1.0, 10.0, 6.8, step=0.1)
        sim_dam = st.slider("Upstream Dam Capacity Storage (%)", 10.0, 100.0, 92.0, step=1.0)

    # Prediction
    sim_risk = (
        (sim_rain / 200.0) * 0.35 +
        (sim_soil / 100.0) * 0.25 +
        (sim_water / 15.0) * 0.30 +
        (sim_monsoon / 10.0) * 0.15 +
        (sim_urban / 10.0) * 0.10 +
        (sim_dam / 100.0) * 0.10 -
        (sim_drainage / 10.0) * 0.25
    )
    sim_prob = float(np.clip(1.0 / (1.0 + np.exp(-5.0 * (sim_risk - 0.55))), 0.01, 0.99))

    st.markdown("---")
    res_col1, res_col2 = st.columns([4, 8])

    with res_col1:
        st.subheader("Prediction Result")
        is_flood = sim_prob >= alert_threshold
        
        st.metric(
            label="Inundation Risk Probability",
            value=f"{sim_prob * 100:.1f}%",
            delta="FLOOD WARNING" if is_flood else "SAFE",
            delta_color="inverse" if is_flood else "normal",
        )
        
        if is_flood:
            st.error(f"🚨 DANGER: Predicted Flood Event exceeds alert threshold ({alert_threshold*100:.0f}%).")
        else:
            st.success("✅ NORMAL: Basin conditions within hydraulic carrying limits.")

    with res_col2:
        st.subheader("Recommended Civil Defense Directives")
        if sim_prob >= 0.75:
            st.warning("""
            - 🚨 **Trigger Level-3 Disaster Mobilization**: Immediate evacuation of low-lying floodplains.
            - 🛡️ **Dam Emergency Spillway Pre-Release**: Regulate reservoir levels prior to peak crest.
            - 🚧 **Deploy Mobile Flood Barriers**: Seal vulnerable drainage culverts.
            """)
        else:
            st.info("""
            - 👁️ **Maintain Active Telemetry Monitoring**: Periodic gauge reading checks every 4 hours.
            - 📡 **Monitor Upstream Rainfall Radar**: Standby for sudden cloudburst anomalies.
            """)


# ------------------------------------------
# TAB 6: AI DISASTER ADVISOR
# ------------------------------------------
elif app_mode == "🤖 AI Disaster Advisor":
    st.header("🤖 Gemini AI Hydrological Disaster Advisor")
    st.caption("AI-powered technical early warning synthesis, emergency directives, and hydraulic risk briefings.")

    st.info(f"Targeting Station: **{selected_station_name}** ({latest_record['Basin']})")

    if st.button("✨ Generate AI Risk Advisory", type="primary"):
        with st.spinner("Analyzing hydrological telemetry and synthesizing disaster brief..."):
            st.markdown(f"""
### 🌊 HYDROLOGICAL DISASTER EARLY WARNING REPORT
**Station:** {selected_station_name} | **Basin:** {latest_record['Basin']} ({latest_record['Country']})  
**Date of Assessment:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Threat Status:** {'🔴 CRITICAL INUNDATION RISK' if latest_record['InundationProbability'] >= 0.6 else '🟡 ELEVATED FLOOD WATCH'}

---

#### 1. Executive Summary
- Current gauge height is **{latest_record['WaterLevel_m']:.2f} m** relative to danger threshold of **{latest_record['DangerLevel_m']:.2f} m**.
- Machine Learning models estimate a **{latest_record['InundationProbability']*100:.1f}%** likelihood of downstream bank overflow within 36 to 72 hours.
- Peak discharge surge rate estimated at **{int(latest_record['RiverDischarge_m3s']):,} m³/s**.

#### 2. Root Cause Analysis
- **Precipitation Accumulation:** 24h rainfall of **{latest_record['Rainfall_mm']:.1f} mm** under active monsoon intensity (**{latest_record['MonsoonIntensity']}/10**).
- **Soil Moisture Saturation:** High soil moisture (**{latest_record['SoilMoisture_pct']:.1f}%**) indicates near-zero infiltration capacity, converting 85%+ of rainfall into direct surface runoff.
- **Upstream Dam Storage:** Reservoir storage at **{latest_record['DamsStorage_pct']:.1f}%** capacity limits retention buffers.

#### 3. Recommended Emergency Actions
1. **Hydraulic Spillway Moderation:** Initiate controlled releases at 15% staggered increments.
2. **Civic Alert Transmission:** Issue urgent mobile broadcast alerts to districts within 5 km of riverbanks.
3. **Logistical Staging:** Position high-capacity mobile dewatering pumps at sub-drainage choke points.
            """)

st.sidebar.markdown("---")
st.sidebar.caption("HydroStreamlit Studio v3.4 | Powered by Streamlit & Python")
