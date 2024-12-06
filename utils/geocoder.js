const axios = require('axios');
require('dotenv').config();

const HERE_API_KEY = process.env.HERE_API_KEY;

async function getCoordinatesFromCEP(cep) {
  try {
    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: cep,
        apiKey: HERE_API_KEY
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const { lat, lng } = response.data.items[0].position;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error('não foi possível obter as coordenadas para este CEP');
    }
  } catch (error) {
    console.error('erro ao obter coordenadas:', error);
    return null;
  }
}

module.exports = { getCoordinatesFromCEP };