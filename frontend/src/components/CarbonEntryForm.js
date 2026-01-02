import React, { useState, useEffect, useCallback } from 'react';
import { carbonAPI } from '../services/api';
import './CarbonEntryForm.css';

function CarbonEntryForm({ onSubmit }) {
  const [category, setCategory] = useState('Energy');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appliances, setAppliances] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(null);

  const [applianceName, setApplianceName] = useState('');
  const [powerWatts, setPowerWatts] = useState('');
  const [hoursUsed, setHoursUsed] = useState('');
  const [daysUsed, setDaysUsed] = useState('1');
  const [energySource, setEnergySource] = useState('GRID_AVERAGE');

  const [transportType, setTransportType] = useState('');
  const [distance, setDistance] = useState('');

  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');

  const [wasteQuantity, setWasteQuantity] = useState('');

  useEffect(() => {
    fetchAppliancesAndTransport();
  }, []);

  const fetchAppliancesAndTransport = async () => {
    try {
      const [appRes, transRes] = await Promise.all([
        carbonAPI.getAppliances(),
        carbonAPI.getTransportTypes()
      ]);
      // appRes.data is the array from axios response
      const applianceList = Array.isArray(appRes.data) ? appRes.data : [];
      const transportList = Array.isArray(transRes.data) ? transRes.data : [];
      
      console.log('Appliances loaded:', applianceList.length);
      console.log('Transport types loaded:', transportList.length);
      
      setAppliances(applianceList);
      setTransportTypes(transportList);
    } catch (err) {
      console.error('Error fetching appliances/transport:', err.message);
      setAppliances([]);
      setTransportTypes([]);
    }
  };

  const calculateAndUpdate = useCallback(async () => {
    let amount = 0;
    const formData = {};

    try {
      if (category === 'Energy') {
        if (!applianceName && !powerWatts) {
          setCalculatedAmount(null);
          return;
        }
        if (!hoursUsed) return;

        const power = powerWatts || (appliances.includes(applianceName) ? parseInt(powerWatts) : 0);

        formData.applianceName = applianceName;
        formData.powerWatts = powerWatts || power;
        formData.hoursUsed = parseFloat(hoursUsed);
        formData.daysUsed = parseFloat(daysUsed) || 1;
        formData.energySource = energySource;

        const kw = (powerWatts ? parseFloat(powerWatts) : 3500) / 1000;
        const kwh = kw * parseFloat(hoursUsed) * (parseFloat(daysUsed) || 1);
        amount = kwh * 0.43;
      } else if (category === 'Transportation') {
        if (!transportType || !distance) {
          setCalculatedAmount(null);
          return;
        }
        formData.transportType = transportType;
        formData.distance = parseFloat(distance);
        amount = parseFloat(distance) * 0.192;
      } else if (category === 'Food') {
        if (!foodType || !quantity) {
          setCalculatedAmount(null);
          return;
        }
        formData.foodType = foodType;
        formData.quantity = parseFloat(quantity);
        amount = parseFloat(quantity) * 12;
      } else if (category === 'Waste') {
        if (!wasteQuantity) {
          setCalculatedAmount(null);
          return;
        }
        formData.quantityKg = parseFloat(wasteQuantity);
        amount = parseFloat(wasteQuantity) * 0.5;
      }

      setCalculatedAmount(amount.toFixed(3));
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }, [category, applianceName, powerWatts, hoursUsed, daysUsed, energySource, transportType, distance, foodType, quantity, wasteQuantity, appliances]);

  useEffect(() => {
    calculateAndUpdate();
  }, [calculateAndUpdate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!calculatedAmount) {
      alert('Please fill in all required fields');
      return;
    }

    const data = { category, date, description };

    if (category === 'Energy') {
      data.applianceName = applianceName;
      data.powerWatts = powerWatts ? parseFloat(powerWatts) : null;
      data.hoursUsed = parseFloat(hoursUsed);
      data.daysUsed = parseFloat(daysUsed) || 1;
      data.energySource = energySource;
    } else if (category === 'Transportation') {
      data.transportType = transportType;
      data.distance = parseFloat(distance);
    } else if (category === 'Food') {
      data.foodType = foodType;
      data.quantity = parseFloat(quantity);
    } else if (category === 'Waste') {
      data.quantityKg = parseFloat(wasteQuantity);
    }

    setLoading(true);
    onSubmit(data);
    
    setTimeout(() => {
      setApplianceName('');
      setPowerWatts('');
      setHoursUsed('');
      setDaysUsed('1');
      setEnergySource('GRID_AVERAGE');
      setTransportType('');
      setDistance('');
      setFoodType('');
      setQuantity('');
      setWasteQuantity('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCalculatedAmount(null);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="form-card">
      <h2>Add Carbon Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Energy">Energy (Appliances)</option>
            <option value="Transportation">Transportation</option>
            <option value="Food">Food Consumption</option>
            <option value="Waste">Waste</option>
          </select>
        </div>

        {category === 'Energy' && (
          <>
            <div className="form-group">
              <label>Appliance Name:</label>
              <select value={applianceName} onChange={(e) => setApplianceName(e.target.value)}>
                <option value="">-- Select Appliance --</option>
                {appliances.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Power Rating (Watts) {applianceName && '- Auto-filled'}:</label>
              <input
                type="number"
                value={powerWatts}
                onChange={(e) => setPowerWatts(e.target.value)}
                placeholder="e.g., 1500"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hours Used:</label>
                <input
                  type="number"
                  step="0.5"
                  value={hoursUsed}
                  onChange={(e) => setHoursUsed(e.target.value)}
                  placeholder="e.g., 2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Days:</label>
                <input
                  type="number"
                  value={daysUsed}
                  onChange={(e) => setDaysUsed(e.target.value)}
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Energy Source:</label>
              <select value={energySource} onChange={(e) => setEnergySource(e.target.value)}>
                <option value="GRID_AVERAGE">Grid Average (0.43 kg CO2/kWh)</option>
                <option value="COAL">Coal (0.95 kg CO2/kWh)</option>
                <option value="NATURAL_GAS">Natural Gas (0.49 kg CO2/kWh)</option>
                <option value="NUCLEAR">Nuclear (0.012 kg CO2/kWh)</option>
                <option value="HYDRO">Hydroelectric (0.004 kg CO2/kWh)</option>
                <option value="WIND">Wind (0.011 kg CO2/kWh)</option>
                <option value="SOLAR">Solar (0.041 kg CO2/kWh)</option>
              </select>
            </div>
          </>
        )}

        {category === 'Transportation' && (
          <>
            <div className="form-group">
              <label>Transport Type:</label>
              <select value={transportType} onChange={(e) => setTransportType(e.target.value)} required>
                <option value="">-- Select Transport --</option>
                {transportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Distance (km):</label>
              <input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g., 50"
                required
              />
            </div>
          </>
        )}

        {category === 'Food' && (
          <>
            <div className="form-group">
              <label>Food Type:</label>
              <select value={foodType} onChange={(e) => setFoodType(e.target.value)} required>
                <option value="">-- Select Food --</option>
                <option value="Beef">Beef</option>
                <option value="Lamb">Lamb</option>
                <option value="Cheese">Cheese</option>
                <option value="Pork">Pork</option>
                <option value="Fish">Fish</option>
                <option value="Chicken">Chicken</option>
                <option value="Eggs">Eggs</option>
                <option value="Milk">Milk</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Nuts">Nuts</option>
                <option value="Grains">Grains</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity (kg):</label>
              <input
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 0.5"
                required
              />
            </div>
          </>
        )}

        {category === 'Waste' && (
          <div className="form-group">
            <label>Waste Quantity (kg):</label>
            <input
              type="number"
              step="0.1"
              value={wasteQuantity}
              onChange={(e) => setWasteQuantity(e.target.value)}
              placeholder="e.g., 2"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes about this entry"
            rows="2"
          ></textarea>
        </div>

        {calculatedAmount && (
          <div className="calculation-result">
            <strong>Calculated CO2 Footprint:</strong>
            <div className="result-value">{calculatedAmount} kg CO2</div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading || !calculatedAmount}>
          {loading ? 'Adding Entry...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
}

export default CarbonEntryForm;
