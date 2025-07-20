export class JWEPUBParserError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);

    this.code = `meeting-schedules-parser/failed-${code}`;
  }
}
