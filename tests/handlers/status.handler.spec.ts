import { StatusHandler } from '../../src/handlers';

jest.mock('@frankmerema/is-port-reachable');

describe('StatusHandler', () => {
  /* eslint-disable-next-line  @typescript-eslint/no-var-requires */
  const isPortReachable = require('@frankmerema/is-port-reachable')
    .isPortReachable;
  const statusHandler = new StatusHandler();

  let promise: Promise<boolean | Error>;

  beforeEach(() => {
    promise = null;
    isPortReachable.mockImplementation(() => promise);
  });

  test('check that the services are online', async () => {
    promise = Promise.resolve(true);

    await expect(
      statusHandler.checkIfOpenWeatherMapIsOnline()
    ).resolves.toEqual({ openWeatherMap: 'ONLINE' });
    expect(isPortReachable).toHaveBeenCalledWith(80, {
      host: 'api.openweathermap.org'
    });
  });

  test('check that the services are offline', async () => {
    spyOn(global.console, 'error');
    promise = Promise.reject('Just because...');

    await expect(
      statusHandler.checkIfOpenWeatherMapIsOnline()
    ).resolves.toEqual({ openWeatherMap: 'OFFLINE' });
    expect(isPortReachable).toHaveBeenCalledWith(80, {
      host: 'api.openweathermap.org'
    });
    /* eslint-disable-next-line */
    expect(console.error).toHaveBeenCalledWith('Just because...');
  });
});
