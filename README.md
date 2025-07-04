# React & Node.js 게시판 애플리케이션

이 프로젝트는 사용자 인증 및 간단한 게시판 기능을 제공하는 풀스택 웹 애플리케이션입니다. 프론트엔드는 React.js로, 백엔드는 Node.js (Express)로 구축되었습니다.

## 🚀 주요 기능

*   **사용자 인증:**
    *   로그인, 로그아웃
    *   토큰 기반 세션 관리
    *   로그인 상태에 따른 라우트 보호
*   **게시판 관리:**
    *   게시글 목록 조회
    *   새 게시글 작성
    *   특정 게시글 상세 조회
*   **오류 처리:**
    *   **프론트엔드:** 전역 오류 핸들링 (콘솔, 로컬 스토리지 로깅), React Error Boundary를 통한 UI 복원력
    *   **백엔드:** Winston을 이용한 상세 서버 로깅, 전역 오류 미들웨어 및 프로세스 레벨 오류 처리
*   **반응형 UI:** Bootstrap을 활용하여 세련되고 반응형인 사용자 인터페이스를 제공합니다.

## 🛠️ 사용된 기술 스택

### 프론트엔드 (client)

*   **React.js:** 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
*   **React Router DOM:** SPA(Single Page Application) 라우팅 관리
*   **Context API:** 전역 상태 관리 (인증, 게시글 데이터)
*   **Bootstrap & React-Bootstrap:** 반응형 디자인 및 UI 컴포넌트
*   **`fetch` API:** 백엔드 API 통신

### 백엔드 (server)

*   **Node.js:** 서버 런타임 환경
*   **Express.js:** 웹 애플리케이션 프레임워크
*   **CORS:** 교차 출처 리소스 공유 활성화
*   **Body-parser:** 요청 본문 파싱
*   **Winston:** 강력하고 유연한 로깅 라이브러리
*   **Winston Daily Rotate File:** Winston 로거를 위한 일별 파일 로테이션
*   **Crypto:** 토큰 생성에 사용 (Node.js 내장 모듈)

## ⚙️ 환경 설정 및 실행 방법

### 전제 조건

*   Node.js (npm 또는 Yarn 포함)

### 설치

1.  **저장소 클론:**
    ```bash
    git clone <저장소_URL>
    cd kw-front-end
    ```
2.  **프론트엔드 의존성 설치:**
    ```bash
    cd client
    npm install
    ```
3.  **백엔드 의존성 설치:**
    ```bash
    cd ../server
    npm install
    ```

### 애플리케이션 실행 (통합 환경)

프론트엔드와 백엔드가 하나의 Node.js 서버에서 동작하도록 설정되어 있습니다.

1.  **프론트엔드 빌드:**
    `client` 디렉토리에서 React 애플리케이션을 빌드합니다.
    ```bash
    cd client
    npm run build
    ```
    이 명령어는 `client/build` 디렉토리에 정적 파일을 생성합니다.

2.  **통합 서버 실행:**
    `server` 디렉토리에서 다음 명령어를 실행하여 백엔드 API와 프론트엔드 정적 파일을 함께 제공하는 서버를 시작합니다.
    ```bash
    cd ../server
    node index.js
    ```
    서버는 `http://localhost:5001`에서 실행됩니다. 웹 브라우저를 열고 이 주소로 접속하면 React 애플리케이션이 표시됩니다.

### 테스트 계정

*   **사용자 이름 (Username):** `testuser`
*   **비밀번호 (Password):** `password`

## 🌐 API 엔드포인트 (백엔드)

모든 API 엔드포인트는 `/api`를 기본 경로로 사용합니다.

### 인증 (Authentication)

| 메서드 | 엔드포인트         | 설명             | 요청 본문 (JSON)                 | 응답 예시 (성공)                               |
| :----- | :----------------- | :--------------- | :------------------------------- | :--------------------------------------------- |
| `POST` | `/api/auth/login`  | 사용자 로그인    | `{ "username": "...", "password": "..." }` | `{ "resultCode": 0, "data": { "user": { ... }, "token": "..." } }` |
| `POST` | `/api/auth/logout` | 사용자 로그아웃  | (없음)                           | `{ "resultCode": 0, "message": "로그아웃 되었습니다." }` |
| `GET`  | `/api/auth/me`     | 현재 사용자 정보 | (없음)                           | `{ "resultCode": 0, "data": { "user": { ... } } }` |

### 게시글 (Posts)

| 메서드 | 엔드포인트           | 설명             | 요청 본문 (JSON)                 | 응답 예시 (성공)                               |
| :----- | :------------------- | :--------------- | :------------------------------- | :--------------------------------------------- |
| `GET`  | `/api/posts`         | 모든 게시글 조회 | (없음)                           | `{ "resultCode": 0, "data": [ { ...post }, ... ] }` |
| `POST` | `/api/posts`         | 새 게시글 작성   | `{ "title": "...", "content": "..." }` | `{ "resultCode": 0, "data": { ...newPost } }` |
| `GET`  | `/api/posts/:postId` | 특정 게시글 조회 | (없음)                           | `{ "resultCode": 0, "data": { ...post } }` |

## ⚠️ 오류 처리

### 프론트엔드 (`client/src/utils/errorHandler.js`)

*   `logError(context, error, additionalInfo)`: 콘솔에 오류를 출력하고, `localStorage`에 오류 정보를 저장합니다.
*   `setupGlobalErrorHandlers()`: `window.onerror`와 `window.onunhandledrejection`을 설정하여 처리되지 않은 전역 JavaScript 오류 및 Promise 거부를 포착합니다.
*   `ErrorBoundary` 컴포넌트: React 컴포넌트 트리 내에서 발생하는 오류를 잡아 사용자에게 폴백 UI를 보여줍니다.

### 백엔드 (`server/index.js`, `server/config/logger.js`, `server/utils/responseHandler.js`)

*   **Winston 로거:** `server/config/logger.js`에 설정된 Winston을 통해 상세한 서버 로그를 기록합니다.
*   **전역 오류 미들웨어:** Express 애플리케이션의 마지막 미들웨어로, 모든 처리되지 않은 오류를 포착하여 로깅하고 클라이언트에 표준화된 오류 응답을 보냅니다.
*   **프로세스 이벤트 리스너:** `process.on('unhandledRejection')` 및 `process.on('uncaughtException')`를 사용하여 Node.js 프로세스 레벨의 치명적인 오류를 처리하고 로깅합니다.

