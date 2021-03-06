import request from 'supertest';
import { start } from '../../src/server';

const weatherResult = {
  coord: {
    lon: 5.71,
    lat: 51.25
  },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d'
    }
  ],
  base: 'stations',
  main: {
    temp: 298.6,
    pressure: 1021,
    humidity: 50,
    temp_min: 296.15,
    temp_max: 300.93
  },
  visibility: 10000,
  wind: {
    speed: 2.1,
    deg: 140
  },
  clouds: {
    all: 0
  },
  dt: 1563867899,
  sys: {
    type: 1,
    id: 1527,
    message: 0.0084,
    country: 'NL',
    sunrise: 1563853700,
    sunset: 1563910715
  },
  timezone: 7200,
  id: 2744911,
  name: 'Weert',
  cod: 200
};

const fetchWeatherForCityByCityNameMock = jest
  .fn()
  .mockResolvedValue(weatherResult);
const fetchWeatherForCityByIdMock = jest.fn().mockResolvedValue(weatherResult);
const fetchWeatherForCityByCoordinatesMock = jest
  .fn()
  .mockResolvedValue(weatherResult);
const fetchWeatherForCityByZipMock = jest.fn().mockResolvedValue(weatherResult);

jest.mock('../../src/handlers/weather.handler', () => {
  return {
    WeatherHandler: jest.fn().mockImplementation(() => {
      return {
        fetchWeatherForCityByCityName: fetchWeatherForCityByCityNameMock,
        fetchWeatherForCityById: fetchWeatherForCityByIdMock,
        fetchWeatherForCityByCoordinates: fetchWeatherForCityByCoordinatesMock,
        fetchWeatherForCityByZip: fetchWeatherForCityByZipMock
      };
    })
  };
});

describe('WeatherRoutes', () => {
  let app: any;

  beforeAll(() => {
    app = start();
  });

  afterAll(() => {
    app.close();
  });

  beforeEach(() => {
    fetchWeatherForCityByCityNameMock.mockClear();
    fetchWeatherForCityByIdMock.mockClear();
    fetchWeatherForCityByCoordinatesMock.mockClear();
    fetchWeatherForCityByZipMock.mockClear();
  });

  describe('fetch weather', () => {
    describe('successful', () => {
      test('via /city/name/:name endpoint', async () => {
        const response = await request(app).get('/api/weather/city/name/weert');

        expect(fetchWeatherForCityByCityNameMock).toHaveBeenCalledWith('weert');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(weatherResult);
      });

      test('via /city/id/:id endpoint', async () => {
        const response = await request(app).get('/api/weather/city/id/2744911');

        expect(fetchWeatherForCityByIdMock).toHaveBeenCalledWith('2744911');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(weatherResult);
      });

      test('via /city/coordinates/:lon/:lat endpoint', async () => {
        const response = await request(app).get(
          '/api/weather/city/coordinates/5.70694/51.251671'
        );

        expect(fetchWeatherForCityByCoordinatesMock).toHaveBeenCalledWith(
          '5.70694',
          '51.251671'
        );
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(weatherResult);
      });

      test('via /city/zip/:zip/:country endpoint', async () => {
        const response = await request(app).get(
          '/api/weather/city/zip/6002/nl'
        );

        expect(fetchWeatherForCityByZipMock).toHaveBeenCalledWith('6002', 'nl');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(weatherResult);
      });
    });

    describe('failing', () => {
      const customRes404 = {
        config: {},
        code: 404,
        response: {
          data: {
            message: 'API not valid, because of test'
          },
          status: 404,
          statusText: 'Not reachable...',
          headers: {},
          config: {}
        }
      };

      const customRes401 = {
        config: {},
        code: 401,
        response: {
          data: {
            message: 'API not valid, because of test'
          },
          status: 401,
          statusText: 'Not reachable...',
          headers: {},
          config: {}
        }
      };

      beforeEach(() => {
        fetchWeatherForCityByCityNameMock.mockRejectedValueOnce(customRes404);
        fetchWeatherForCityByIdMock.mockRejectedValueOnce(customRes404);
        fetchWeatherForCityByCoordinatesMock.mockRejectedValueOnce(
          customRes401
        );
        fetchWeatherForCityByZipMock.mockRejectedValueOnce(customRes401);
      });

      test('via /city/name/:name endpoint', async () => {
        const response = await request(app).get('/api/weather/city/name/weert');

        expect(fetchWeatherForCityByCityNameMock).toHaveBeenCalledWith('weert');
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({
          code: 404,
          message: customRes404.response.data.message,
          statusText: customRes404.response.statusText
        });
      });

      test('via /city/id/:id endpoint', async () => {
        const response = await request(app).get('/api/weather/city/id/2744911');

        expect(fetchWeatherForCityByIdMock).toHaveBeenCalledWith('2744911');
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({
          code: 404,
          message: customRes404.response.data.message,
          statusText: customRes404.response.statusText
        });
      });

      test('via /city/coordinates/:lon/:lat endpoint', async () => {
        const response = await request(app).get(
          '/api/weather/city/coordinates/5.70694/51.251671'
        );

        expect(fetchWeatherForCityByCoordinatesMock).toHaveBeenCalledWith(
          '5.70694',
          '51.251671'
        );
        expect(response.status).toEqual(401);
        expect(response.body).toEqual({
          code: 401,
          message:
            'Invalid API key! Did exceeded your limits || provided a correct `openWeatherMapKey` in your config?',
          statusText: customRes404.response.statusText
        });
      });

      test('via /city/zip/:zip/:country endpoint', async () => {
        const response = await request(app).get(
          '/api/weather/city/zip/6002/nl'
        );

        expect(fetchWeatherForCityByZipMock).toHaveBeenCalledWith('6002', 'nl');
        expect(response.status).toEqual(401);
        expect(response.body).toEqual({
          code: 401,
          message:
            'Invalid API key! Did exceeded your limits || provided a correct `openWeatherMapKey` in your config?',
          statusText: customRes404.response.statusText
        });
      });
    });
  });
});
