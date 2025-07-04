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
*   **반응형 UI:** (기본적인 CSS만 적용되어 있으나, 확장을 통해 반응형 디자인 구현 가능)

## 🛠️ 사용된 기술 스택

### 프론트엔드 (my-react-app)

*   **React.js:** 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
*   **React Router DOM:** SPA(Single Page Application) 라우팅 관리
*   **Context API:** 전역 상태 관리 (인증, 게시글 데이터)
*   **CSS:** 스타일링
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
    cd my-react-app
    npm install
    ```
3.  **백엔드 의존성 설치:**
    ```bash
    cd ../server
    npm install
    ```

### 애플리케이션 실행

1.  **백엔드 서버 실행:**
    `server` 디렉토리에서 다음 명령어를 실행합니다.
    ```bash
    cd server
    node index.js
    ```
    서버는 기본적으로 `http://localhost:5001`에서 실행됩니다.
    (참고: 현재 백엔드 데이터는 인메모리 방식이므로, 서버 재시작 시 모든 데이터가 초기화됩니다.)

### 테스트 계정

*   **사용자 이름 (Username):** `testuser`
*   **비밀번호 (Password):** `password`

2.  **프론트엔드 애플리케이션 실행:**
    `my-react-app` 디렉토리에서 다음 명령어를 실행합니다.
    ```bash
    cd my-react-app
    npm start
    ```
    프론트엔드 애플리케이션은 기본적으로 `http://localhost:3000`에서 실행되며, `/api` 요청은 백엔드 서버로 프록시됩니다.

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

### 프론트엔드 (`my-react-app/src/utils/errorHandler.js`)

*   `logError(context, error, additionalInfo)`: 콘솔에 오류를 출력하고, `localStorage`에 오류 정보를 저장합니다.
*   `setupGlobalErrorHandlers()`: `window.onerror`와 `window.onunhandledrejection`을 설정하여 처리되지 않은 전역 JavaScript 오류 및 Promise 거부를 포착합니다.
*   `ErrorBoundary` 컴포넌트: React 컴포넌트 트리 내에서 발생하는 오류를 잡아 사용자에게 폴백 UI를 보여줍니다.

### 백엔드 (`server/index.js`, `server/config/logger.js`, `server/utils/responseHandler.js`)

*   **Winston 로거:** `server/config/logger.js`에 설정된 Winston을 통해 상세한 서버 로그를 기록합니다.
*   **전역 오류 미들웨어:** Express 애플리케이션의 마지막 미들웨어로, 모든 처리되지 않은 오류를 포착하여 로깅하고 클라이언트에 표준화된 오류 응답을 보냅니다.
*   **프로세스 이벤트 리스너:** `process.on('unhandledRejection')` 및 `process.on('uncaughtException')`를 사용하여 Node.js 프로세스 레벨의 치명적인 오류를 처리하고 로깅합니다.

## 💡 향후 개선 사항

*   **데이터베이스 통합:** 현재 인메모리 데이터 저장 방식은 서버 재시작 시 데이터가 손실됩니다. MongoDB, PostgreSQL 등 영구적인 데이터베이스를 통합하여 데이터를 지속적으로 저장하도록 개선할 수 있습니다.
*   **사용자 등록 기능:** 현재는 `testuser`만 존재합니다. 새로운 사용자가 직접 가입할 수 있는 등록 기능을 추가할 수 있습니다.
*   **게시글 수정/삭제:** 게시글 수정 및 삭제 기능을 추가하여 CRUD(Create, Read, Update, Delete) 작업을 완성할 수 있습니다.
*   **UI/UX 개선:** Material-UI, Ant Design, Bootstrap 등 UI 라이브러리를 활용하여 더 현대적이고 사용자 친화적인 인터페이스를 구축할 수 있습니다.
*   **테스트 코드 작성:** 프론트엔드 및 백엔드에 대한 단위 및 통합 테스트 코드를 작성하여 코드의 안정성과 유지보수성을 높일 수 있습니다.
*   **배포 자동화:** CI/CD 파이프라인을 구축하여 개발 및 배포 프로세스를 자동화할 수 있습니다.
