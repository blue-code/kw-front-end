import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setupGlobalErrorHandlers } from './utils/errorHandler'; // 전역 오류 핸들러 임포트

// 전역 오류 핸들러 설정
// React 컴포넌트 트리 외부에서 발생하는 오류나 처리되지 않은 Promise 거부 등을 처리합니다.
setupGlobalErrorHandlers();

const root = ReactDOM.createRoot(document.getElementById('root'));

// React Error Boundary를 위한 간단한 예시 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트 합니다.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 오류 로깅 유틸리티를 사용하여 오류를 기록합니다.
    // logError는 내부적으로 console.error 및 localStorage 로깅을 수행합니다.
    // require('./utils/errorHandler').default('ErrorBoundary', error, errorInfo);
    // 위 방식 대신 import한 logError를 사용합니다.
    // 주의: componentDidCatch 내에서 setState를 호출하여 UI를 업데이트할 수 있지만,
    // 여기서는 주로 오류 로깅에 집중합니다. getDerivedStateFromError가 UI 업데이트를 담당합니다.
    const logErrorDirectly = require('./utils/errorHandler').default; // 동적 임포트 또는 일반 임포트
    logErrorDirectly('ReactErrorBoundary', error, { additionalInfo: errorInfo });
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스텀하여 렌더링할 수 있습니다.
      return (
        <div>
          <h2>앗! 문제가 발생했습니다.</h2>
          <p>애플리케이션에 오류가 발생하여 정상적으로 실행할 수 없습니다.</p>
          <p>잠시 후 다시 시도해주시거나, 문제가 지속되면 관리자에게 문의해주세요.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }

    return this.props.children;
  }
}


root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log); // 성능 측정 결과를 콘솔에 로깅
