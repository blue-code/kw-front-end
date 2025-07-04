// 오류 로깅 유틸리티

/**
 * 오류를 콘솔에 기록하고, 선택적으로 파일/서버로 전송합니다.
 * 브라우저 환경에서는 직접적인 파일 쓰기가 제한적이므로,
 * 이 함수는 console.error를 기본으로 사용하고,
 * 실제 파일 저장이나 서버 로깅은 애플리케이션의 요구사항에 따라 확장될 수 있습니다.
 *
 * @param {string} context 오류가 발생한 컨텍스트 (예: 'LoginForm', 'BoardContext')
 * @param {Error} error 실제 오류 객체
 * @param {object} [additionalInfo] 추가 정보 (선택 사항)
 */
const logError = (context, error, additionalInfo = {}) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : 'N/A';

  // 1. 터미널(콘솔)에 오류 출력
  console.error(
    `[ERROR LOG - ${timestamp}] Context: ${context}\nMessage: ${errorMessage}\nStack: ${errorStack}`,
    additionalInfo
  );

  // 2. 파일로 저장 (개념적 - 브라우저에서는 직접 파일 I/O 불가)
  // 실제 구현 시:
  // - localStorage/sessionStorage에 저장 (크기 제한 주의)
  // - 서버로 오류 정보 전송 API 호출
  // - IndexedDB 사용
  // 이 예제에서는 localStorage에 간단히 저장하는 방식을 시뮬레이션합니다.
  try {
    const errorLogEntry = {
      timestamp,
      context,
      message: errorMessage,
      stack: errorStack,
      additionalInfo,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    let errorLogs = JSON.parse(localStorage.getItem('appErrorLog') || '[]');
    errorLogs.push(errorLogEntry);
    // 로그 크기 제한 (예: 최근 100개만 저장)
    if (errorLogs.length > 100) {
      errorLogs = errorLogs.slice(errorLogs.length - 100);
    }
    localStorage.setItem('appErrorLog', JSON.stringify(errorLogs));
    console.log('[ErrorHandler] Error logged to localStorage (simulated file log).');

  } catch (storageError) {
    console.error('[ErrorHandler] Failed to log error to localStorage:', storageError);
  }

  // 3. 사용자에게 보여줄 수 있는 일반적인 오류 메시지 반환 (선택 사항)
  // return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
};

export default logError;

/**
 * 전역 오류 핸들러 설정 (React Error Boundary와 함께 사용하거나 최상위에서 호출)
 *
 * window.onerror: 스크립트 실행 중 발생하는 대부분의 자바스크립트 오류를 잡습니다.
 * window.onunhandledrejection: Promise가 reject되었으나 .catch()로 처리되지 않은 경우의 오류를 잡습니다.
 */
export const setupGlobalErrorHandlers = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    logError('GlobalErrorHandler (window.onerror)', error || new Error(String(message)), {
      source,
      lineno,
      colno,
    });
    // true를 반환하면 브라우저 콘솔에 오류가 표시되지 않도록 할 수 있지만,
    // 개발 중에는 false로 두어 기본 동작을 유지하는 것이 좋습니다.
    return false;
  };

  window.onunhandledrejection = (event) => {
    logError('GlobalErrorHandler (unhandledrejection)', event.reason || new Error('Unhandled promise rejection'), {
      promiseEvent: event,
    });
    // 기본 동작 (콘솔에 오류 로깅)을 막지 않습니다.
  };

  console.log('[ErrorHandler] Global error handlers set up.');
};

// 애플리케이션 시작 시 전역 오류 핸들러를 설정하려면 index.js 등에서 호출합니다.
// 예: import { setupGlobalErrorHandlers } from './utils/errorHandler';
//      setupGlobalErrorHandlers();
