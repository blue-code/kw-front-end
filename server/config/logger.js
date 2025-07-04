const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// 로그 파일을 저장할 디렉터리 경로
const logDir = path.join(__dirname, '../logs'); // /app/server/logs

// 로그 디렉터리가 없으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 레벨 정의 (필요에 따라 환경 변수 등으로 관리 가능)
const logLevel = process.env.LOG_LEVEL || 'info';

// 로그 형식 정의
const logFormat = winston.format.printf(({ timestamp, level, message, stack, context, ...metadata }) => {
  let log = `${timestamp} [${level}]`;
  if (context) {
    log += ` [${context}]`;
  }
  log += `: ${message}`;
  if (stack) {
    log += `\nStack: ${stack}`;
  }
  // 기타 메타데이터가 있다면 JSON 형태로 추가 (선택적)
  const remainingMetadata = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
  if (remainingMetadata && remainingMetadata !== '{}') {
    log += `\nMetadata: ${remainingMetadata}`;
  }
  return log;
});

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // 오류 발생 시 스택 트레이스 포함
    winston.format.splat(), // '%s' 형식의 문자열 포맷팅 지원
    logFormat
  ),
  defaultMeta: { service: 'user-service' }, // 모든 로그에 기본적으로 포함될 메타데이터 (선택적)
  transports: [
    // 콘솔 트랜스포트
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 로그 레벨에 따라 색상 적용
        logFormat
      ),
    }),
    // 일별 회전 파일 트랜스포트
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'), // 로그 파일명 패턴
      datePattern: 'YYYY-MM-DD', // 날짜 패턴 (일별)
      zippedArchive: true, // 오래된 로그 파일 압축 여부
      maxSize: '20m', // 각 로그 파일의 최대 크기
      maxFiles: '14d', // 로그 파일 보관 기간 (예: 14일)
      level: logLevel, // 파일 로그 레벨
    }),
    // 오류만 별도로 저장하는 파일 트랜스포트 (선택적)
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error', // 'error' 레벨 이상의 로그만 기록
    }),
  ],
  // 처리되지 않은 예외 처리 (Winston 3.x 이상에서는 exitOnError: false가 기본값)
  // exitOnError: false, // 처리되지 않은 예외 발생 시 프로세스 종료 안 함
});

// 스트림 인터페이스 (Morgan 등과 연동 시 사용 가능)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;

// 터미널 출력을 위해 console.log/error를 직접 사용하도록 오버라이드
if (process.env.NODE_ENV !== 'production') {
  logger.info = (...args) => {
    console.log(...args);
    // 파일 로깅은 그대로 유지하기 위해 원래의 info 메소드 호출
    Object.getPrototypeOf(logger).info.apply(logger, args);
  };
  logger.warn = (...args) => {
    console.warn(...args);
    Object.getPrototypeOf(logger).warn.apply(logger, args);
  };
  logger.error = (...args) => {
    console.error(...args);
    Object.getPrototypeOf(logger).error.apply(logger, args);
  };
}