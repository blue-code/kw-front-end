/**
 * API 응답 코드 및 메시지 상수
 *
 * resultCode 규칙:
 * 0: 성공
 * 400xx: 클라이언트 요청 오류 (입력값, 형식 등)
 * 401xx: 인증 오류
 * 403xx: 권한 오류
 * 404xx: 리소스 없음 오류
 * 500xx: 서버 내부 오류
 */
const errorConstants = {
  SUCCESS: { code: 0, message: '성공적으로 처리되었습니다.' },

  // 400 Bad Request 계열
  INVALID_INPUT: { code: 40001, message: '입력값이 유효하지 않습니다. 다시 확인해주세요.' },
  MISSING_REQUIRED_FIELD: { code: 40002, message: '필수 입력 항목이 누락되었습니다.' },
  INVALID_POST_ID_FORMAT: { code: 40003, message: '게시글 ID 형식이 올바르지 않습니다.' },
  ALREADY_LOGGED_OUT: { code: 40004, message: '이미 로그아웃된 상태이거나 유효하지 않은 세션입니다.' },


  // 401 Unauthorized 계열
  UNAUTHORIZED: { code: 40101, message: '인증이 필요합니다. 로그인 후 다시 시도해주세요.' },
  LOGIN_FAILED: { code: 40102, message: '로그인에 실패했습니다. 사용자 이름 또는 비밀번호를 확인해주세요.' },
  INVALID_TOKEN: { code: 40103, message: '유효하지 않은 토큰입니다. 다시 로그인해주세요.' },

  // 403 Forbidden 계열
  FORBIDDEN_ACCESS: { code: 40301, message: '해당 요청에 대한 접근 권한이 없습니다.' },
  // 예: 게시글 수정/삭제 권한 없음 등

  // 404 Not Found 계열
  RESOURCE_NOT_FOUND: { code: 40401, message: '요청하신 리소스를 찾을 수 없습니다.' },
  POST_NOT_FOUND: { code: 40402, message: '해당 ID의 게시글을 찾을 수 없습니다.' },
  USER_NOT_FOUND: { code: 40403, message: '해당 사용자를 찾을 수 없습니다.' },

  // 500 Internal Server Error 계열
  SERVER_ERROR: { code: 50001, message: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
  DATABASE_ERROR: { code: 50002, message: '데이터베이스 처리 중 오류가 발생했습니다.' }, // 현재는 인메모리지만, 예시로 추가
  TOKEN_GENERATION_ERROR: { code: 50003, message: '토큰 생성 중 오류가 발생했습니다.'},

  // 사용자 정의 오류 추가 가능
  // CUSTOM_ERROR_EXAMPLE: { code: 99901, message: '사용자 정의 오류 메시지입니다.'}
};

// module.exports를 사용하여 다른 파일에서 import 할 수 있도록 합니다.
// Node.js 환경이므로 ES6 모듈 대신 CommonJS 모듈 시스템을 사용합니다.
module.exports = errorConstants;
