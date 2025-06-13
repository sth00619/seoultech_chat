// client/src/utils/swaggerHelper.js
export const showSwaggerToken = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('%c❌ 토큰이 없습니다. 먼저 로그인하세요.', 'color: #e74c3c; font-weight: bold;');
      return;
    }
    
    // 스타일이 적용된 콘솔 출력
    console.log('%c🔐 SWAGGER AUTHORIZATION HELPER', 'color: #3498db; font-size: 20px; font-weight: bold;');
    console.log('%c=====================================', 'color: #95a5a6;');
    
    // Bearer 토큰 (Swagger의 Authorize 버튼에 직접 붙여넣기)
    console.log('%c1️⃣ Swagger Authorize에 붙여넣기:', 'color: #2ecc71; font-size: 14px; font-weight: bold;');
    console.log('%cBearer ' + token, 'color: #e74c3c; background: #ecf0f1; padding: 8px; font-family: monospace; font-size: 12px;');
    
    // 토큰만 (일부 API 테스트 도구용)
    console.log('\n%c2️⃣ 토큰만 필요한 경우:', 'color: #2ecc71; font-size: 14px; font-weight: bold;');
    console.log('%c' + token, 'color: #e74c3c; background: #ecf0f1; padding: 8px; font-family: monospace; font-size: 12px;');
    
    // 사용 방법 안내
    console.log('\n%c📋 사용 방법:', 'color: #f39c12; font-size: 14px; font-weight: bold;');
    console.log('%c1. Swagger UI (http://localhost:3000/api-docs)에서 "Authorize" 버튼 클릭', 'color: #34495e;');
    console.log('%c2. 위의 "Bearer {token}" 전체를 복사하여 입력', 'color: #34495e;');
    console.log('%c3. "Authorize" 클릭 후 "Close"', 'color: #34495e;');
    
    // 토큰 정보
    console.log('\n%cℹ️ 토큰 정보:', 'color: #3498db; font-size: 14px; font-weight: bold;');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('%c사용자 ID: ' + payload.userId, 'color: #7f8c8d;');
      console.log('%c이메일: ' + payload.email, 'color: #7f8c8d;');
      console.log('%c만료 시간: ' + new Date(payload.exp * 1000).toLocaleString(), 'color: #7f8c8d;');
    } catch (e) {
      console.log('%c토큰 파싱 실패', 'color: #e74c3c;');
    }
    
    console.log('%c=====================================', 'color: #95a5a6;');
  };
  
  // 전역으로 사용할 수 있도록 window 객체에 추가
  if (typeof window !== 'undefined') {
    window.showSwaggerToken = showSwaggerToken;
    window.swaggerToken = showSwaggerToken; // 짧은 별칭
  }