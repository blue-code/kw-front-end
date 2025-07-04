const errorConstants = require('./errorConstants');

/**
 * 표준 성공 응답을 생성하여 전송합니다.
 * @param {object} res Express 응답 객체
 * @param {object} [data=null] 클라이언트에 전달할 데이터
 * @param {string} [successKey='SUCCESS'] errorConstants에 정의된 성공 키
 * @param {number} [httpStatusCode=200] HTTP 상태 코드
 */
const sendSuccess = (res, data = null, successKey = 'SUCCESS', httpStatusCode = 200) => {
  const responseDetails = errorConstants[successKey] || errorConstants.SUCCESS; // 키가 없으면 기본 성공 사용
  res.status(httpStatusCode).json({
    resultCode: responseDetails.code,
    resultMessage: responseDetails.message,
    data: data,
  });
};

/**
 * 표준 오류 응답을 생성하여 전송합니다.
 * @param {object} res Express 응답 객체
 * @param {string} errorKey errorConstants에 정의된 오류 키
 * @param {object} [details={}] 추가적인 오류 정보 또는 커스텀 메시지를 담은 객체.
 *                              details.message가 있으면 기본 메시지를 덮어씁니다.
 *                              details.errors (배열) 등으로 구체적인 필드 오류 전달 가능.
 * @param {number} [overrideHttpStatus=null] 기본 HTTP 상태 코드를 덮어쓸 경우 사용
 */
const sendError = (res, errorKey, details = {}, overrideHttpStatus = null) => {
  const errorDetails = errorConstants[errorKey] || errorConstants.SERVER_ERROR; // 키가 없으면 기본 서버 오류 사용

  let httpStatusCode = overrideHttpStatus;
  if (!httpStatusCode) {
    // errorConstants에 httpStatus가 정의되어 있다면 사용, 없으면 일반적인 매핑 또는 500
    if (errorDetails.httpStatus) {
      httpStatusCode = errorDetails.httpStatus;
    } else {
      // resultCode의 첫 세 자리를 기반으로 대략적인 HTTP 상태 코드 추론 (선택적)
      // 예: 400xx -> 400, 401xx -> 401, 500xx -> 500
      const codePrefix = String(errorDetails.code).substring(0, 3);
      if (codePrefix === '400') httpStatusCode = 400;
      else if (codePrefix === '401') httpStatusCode = 401;
      else if (codePrefix === '403') httpStatusCode = 403;
      else if (codePrefix === '404') httpStatusCode = 404;
      else httpStatusCode = 500; // 기본값
    }
  }

  const responseMessage = details.message || errorDetails.message;

  const responsePayload = {
    resultCode: errorDetails.code,
    resultMessage: responseMessage,
    data: null, // 기본적으로 실패 시 data는 null
  };

  // details 객체에 errors 외 다른 정보가 있다면 data 필드에 포함시킬 수 있음
  // 예를 들어, details.validationErrors 등을 data로 전달
  if (details.errors || (Object.keys(details).length > 0 && !details.message)) {
    responsePayload.data = details.errors || details;
  }


  res.status(httpStatusCode).json(responsePayload);
};

module.exports = {
  sendSuccess,
  sendError,
};
