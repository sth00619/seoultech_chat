// 데이터베이스 연결 테스트 스크립트
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 데이터베이스 연결 테스트 시작...\n');

  // 환경 변수 확인
  console.log('📋 환경 변수 설정:');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '[설정됨]' : '[없음]'}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}\n`);

  try {
    // 1. 기본 연결 테스트
    console.log('🔌 MySQL 서버 연결 테스트...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ MySQL 서버 연결 성공!\n');

    // 2. 데이터베이스 존재 확인
    console.log('🗄️ 데이터베이스 존재 확인...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    
    if (dbExists) {
      console.log(`✅ 데이터베이스 '${process.env.DB_NAME}' 존재함\n`);
      
      // 3. 데이터베이스 선택
      await connection.execute(`USE ${process.env.DB_NAME}`);
      
      // 4. 테이블 존재 확인
      console.log('📋 테이블 존재 확인...');
      const [tables] = await connection.execute('SHOW TABLES');
      
      const requiredTables = ['users', 'chat_rooms', 'messages'];
      const existingTables = tables.map(table => Object.values(table)[0]);
      
      console.log('존재하는 테이블들:', existingTables);
      
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.log(`❌ 필수 테이블이 없습니다: ${missingTables.join(', ')}\n`);
        console.log('📝 누락된 테이블 생성 SQL:');
        console.log(generateMissingTableSQL(missingTables));
      } else {
        console.log('✅ 모든 필수 테이블 존재함\n');
        
        // 5. 테이블 데이터 확인
        console.log('📊 테이블 데이터 확인...');
        for (const table of requiredTables) {
          const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`${table}: ${rows[0].count}개 레코드`);
        }
        
        // 6. 지식베이스 테이블 확인
        console.log('\n🧠 지식베이스 테이블 확인...');
        const knowledgeTables = ['knowledge_categories', 'knowledge_base'];
        const existingKnowledgeTables = knowledgeTables.filter(table => existingTables.includes(table));
        
        if (existingKnowledgeTables.length === 0) {
          console.log('⚠️  지식베이스 테이블이 없습니다. 기본 응답만 제공됩니다.');
          console.log('💡 지식베이스 기능을 사용하려면 knowledge_categories, knowledge_base 테이블을 생성하세요.');
        } else {
          console.log(`✅ 지식베이스 테이블 존재: ${existingKnowledgeTables.join(', ')}`);
          
          // 지식베이스 데이터 확인
          if (existingKnowledgeTables.includes('knowledge_base')) {
            const [kbRows] = await connection.execute('SELECT COUNT(*) as count FROM knowledge_base WHERE is_active = TRUE');
            console.log(`활성 지식베이스 항목: ${kbRows[0].count}개`);
          }
        }
      }
      
    } else {
      console.log(`❌ 데이터베이스 '${process.env.DB_NAME}'가 존재하지 않습니다.\n`);
      console.log('📝 데이터베이스 생성 SQL:');
      console.log(`CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    }

    await connection.end();
    console.log('\n🎉 데이터베이스 연결 테스트 완료!');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    console.log('\n🔧 해결 방법:');
    console.log('1. MySQL 서버가 실행 중인지 확인');
    console.log('2. .env 파일의 데이터베이스 설정 확인');
    console.log('3. 데이터베이스 사용자 권한 확인');
  }
}

function generateMissingTableSQL(missingTables) {
  const tableSQL = {
    users: `
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`,
    chat_rooms: `
CREATE TABLE chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT '새로운 채팅',
    last_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`,
    messages: `
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id INT NOT NULL,
    role ENUM('user', 'bot') NOT NULL,
    content TEXT NOT NULL,
    message_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    INDEX idx_chat_room_order (chat_room_id, message_order)
);`
  };

  return missingTables.map(table => tableSQL[table]).join('\n');
}

// 테스트 실행
testDatabaseConnection();