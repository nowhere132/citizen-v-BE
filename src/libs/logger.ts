import winston, {
  format, Logger, transports, Logform,
} from 'winston';
import { SPLAT } from 'triple-beam';
import { isObject, trimEnd } from 'lodash';
import chalk from 'chalk';
import stringify from 'json-stringify-safe';

const {
  combine, timestamp, colorize, label, printf, align, errors,
} = format;

function formatObject(param: any) {
  if (param && param.stack) {
    if (param.ctx && param.type) {
      return stringify(
        {
          code: param.code,
          type: param.type,
          data: param.data,
        },
        null,
        2,
      );
    }
    return stringify(param);
  }
  if (isObject(param)) {
    return stringify(param, null, 2);
  }
  return param;
}

const all = (serviceName: string) => format((info: any, opts: any) => {
  const splat = info[SPLAT] || [];

  const isSplatTypeMessage = typeof info.message === 'string'
      && (info.message.includes('%s') || info.message.includes('%d') || info.message.includes('%j'));
  if (isSplatTypeMessage) {
    return info;
  }
  let message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  message = trimEnd(`${message} ${rest}`);
  return {
    ...info,
    message,
    logger: info.label,
    'service.name': opts.serviceName,
  };
})({ serviceName });

const printJSON = (info: Logform.TransformableInfo) => stringify(info);
const printLine = (info: Logform.TransformableInfo) => `[${info.timestamp}] ${info.level}  ${chalk.blue(info.label.toUpperCase())}: ${info.message} ${
  info.stack ? `\n${info.stack}` : ''
}`;

export default class WinstonLogger {
  static create(logger: string, serviceName = process.env.npm_package_name || ''): Logger {
    const env = process.env.LOGGING_PROFILE || 'default';
    return env !== 'default'
      ? winston.createLogger({
        format: combine(
          errors({ stack: true }),
          format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
          all(serviceName),
          label({ label: logger }),
          timestamp(),
          align(),
          printf(printJSON),
        ),
        transports: [new transports.Console()],
      })
      : winston.createLogger({
        format: combine(
          errors({ stack: true }),
          format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
          colorize(),
          all(serviceName),
          label({ label: logger }),
          timestamp(),
          align(),
          printf(printLine),
        ),
        transports: [new transports.Console()],
      });
  }
}
