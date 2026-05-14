import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';

import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let status: jest.Mock;
  let json: jest.Mock;
  let host: ArgumentsHost;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/api/test' }),
      }),
    } as unknown as ArgumentsHost;
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns 403 for HTTP exceptions while preserving the original response message', () => {
    const filter = new AllExceptionsFilter();
    const exception = new NotFoundException('Missing record');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        path: '/api/test',
        message: exception.getResponse(),
      }),
    );
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 403 for non-HTTP exceptions and logs the original server error', () => {
    const filter = new AllExceptionsFilter();
    const exception = new Error('Unexpected failure');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        path: '/api/test',
        message: 'Internal server error',
      }),
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Unhandled exception on GET /api/test',
      exception.stack,
    );
  });
});
