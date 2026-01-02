const CARBON_INTENSITY = {
  COAL: 0.95,
  NATURAL_GAS: 0.49,
  OIL: 0.78,
  NUCLEAR: 0.012,
  HYDRO: 0.004,
  WIND: 0.011,
  SOLAR: 0.041,
  GRID_AVERAGE: 0.43
};

const APPLIANCE_RATINGS = {
  'Air Conditioner': { power: 3500, unit: 'watts' },
  'Refrigerator': { power: 150, unit: 'watts' },
  'Washing Machine': { power: 500, unit: 'watts' },
  'Dishwasher': { power: 1800, unit: 'watts' },
  'Microwave': { power: 1000, unit: 'watts' },
  'Television': { power: 100, unit: 'watts' },
  'Computer': { power: 300, unit: 'watts' },
  'Laptop': { power: 65, unit: 'watts' },
  'Electric Heater': { power: 1500, unit: 'watts' },
  'Water Heater': { power: 4000, unit: 'watts' },
  'Oven': { power: 2000, unit: 'watts' },
  'Toaster': { power: 800, unit: 'watts' },
  'Hair Dryer': { power: 1800, unit: 'watts' },
  'Vacuum Cleaner': { power: 600, unit: 'watts' },
  'Iron': { power: 1200, unit: 'watts' },
  'Light Bulb (LED)': { power: 10, unit: 'watts' },
  'Light Bulb (CFL)': { power: 15, unit: 'watts' },
  'Light Bulb (Incandescent)': { power: 60, unit: 'watts' },
  'Electric Car Charger': { power: 7000, unit: 'watts' },
  'Dishwasher': { power: 1800, unit: 'watts' }
};

// Transportation carbon intensity (kg CO2 per km)
const TRANSPORT_EMISSIONS = {
  'Car (Gasoline)': 0.192,
  'Car (Diesel)': 0.174,
  'Car (Electric)': 0.078,
  'Bus': 0.089,
  'Train': 0.041,
  'Flight': 0.195,
  'Motorcycle': 0.096,
  'Bicycle': 0
};

const FOOD_EMISSIONS = {
  'Beef': 27,
  'Lamb': 24,
  'Cheese': 23.5,
  'Pork': 12,
  'Fish': 12.96,
  'Chicken': 6.9,
  'Eggs': 4.8,
  'Milk': 3.2,
  'Vegetables': 2,
  'Fruits': 1.5,
  'Nuts': 2.3,
  'Grains': 1.5,
  'Rice': 2.7,
  'Pasta': 1.6
};

/**
 * Calculate carbon footprint for electricity consumption
 * @param {number} powerWatts - Appliance power rating in watts
 * @param {number} hoursUsed - Hours of usage
 * @param {number} daysUsed - Days of usage (optional, for daily appliances)
 * @param {string} energySource - Energy source type (default: GRID_AVERAGE)
 * @returns {number} Carbon footprint in kg CO2
 */
function calculateElectricityCarbonFootprint(powerWatts, hoursUsed, daysUsed = 1, energySource = 'GRID_AVERAGE') {
  // Convert watts to kilowatts
  const powerKw = powerWatts / 1000;
  
  // Total energy consumed in kWh
  const energyKwh = powerKw * hoursUsed * daysUsed;
  
  // Get carbon intensity for the energy source
  const intensity = CARBON_INTENSITY[energySource] || CARBON_INTENSITY.GRID_AVERAGE;
  
  // Calculate CO2 emissions
  const co2kg = energyKwh * intensity;
  
  return parseFloat(co2kg.toFixed(3));
}

/**
 * Calculate carbon footprint for transportation
 * @param {string} transportType - Type of transport
 * @param {number} distance - Distance traveled in km
 * @returns {number} Carbon footprint in kg CO2
 */
function calculateTransportCarbonFootprint(transportType, distance) {
  const emission = TRANSPORT_EMISSIONS[transportType] || 0;
  const co2kg = emission * distance;
  return parseFloat(co2kg.toFixed(3));
}

/**
 * Calculate carbon footprint for food consumption
 * @param {string} foodType - Type of food
 * @param {number} quantity - Quantity in kg
 * @returns {number} Carbon footprint in kg CO2
 */
function calculateFoodCarbonFootprint(foodType, quantity) {
  const emission = FOOD_EMISSIONS[foodType] || 0;
  const co2kg = emission * quantity;
  return parseFloat(co2kg.toFixed(3));
}

/**
 * Get appliance power rating
 * @param {string} applianceName - Name of the appliance
 * @returns {number|null} Power rating in watts or null if not found
 */
function getAppliancePowerRating(applianceName) {
  const appliance = APPLIANCE_RATINGS[applianceName];
  return appliance ? appliance.power : null;
}

/**
 * Calculate carbon footprint for a general category
 * @param {string} category - Category type (Energy, Transportation, Food, Waste)
 * @param {object} data - Data object with category-specific properties
 * @returns {number} Carbon footprint in kg CO2
 */
function calculateCarbonFootprint(category, data) {
  switch (category.toLowerCase()) {
    case 'energy':
      return calculateElectricityCarbonFootprint(
        data.powerWatts,
        data.hoursUsed,
        data.daysUsed || 1,
        data.energySource || 'GRID_AVERAGE'
      );
    
    case 'transportation':
      return calculateTransportCarbonFootprint(
        data.transportType,
        data.distance
      );
    
    case 'food':
      return calculateFoodCarbonFootprint(
        data.foodType,
        data.quantity
      );
    
    case 'waste':
      // Waste calculation: ~0.5 kg CO2 per kg of waste
      return parseFloat((data.quantityKg * 0.5).toFixed(3));
    
    default:
      return 0;
  }
}

module.exports = {
  calculateElectricityCarbonFootprint,
  calculateTransportCarbonFootprint,
  calculateFoodCarbonFootprint,
  calculateCarbonFootprint,
  getAppliancePowerRating,
  APPLIANCE_RATINGS,
  CARBON_INTENSITY,
  TRANSPORT_EMISSIONS,
  FOOD_EMISSIONS
};
