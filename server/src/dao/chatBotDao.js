// server/src/dao/chatbotDao.js
const pool = require('../config/database');

class ChatbotDao {
  // 키워드 기반 지식베이스 검색 (개선된 버전)
  async searchByKeywords(userMessage) {
    try {
      console.log(`🔍 Searching with keywords: "${userMessage}"`);
      
      const searchQuery = userMessage.toLowerCase().trim();
      
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name,
          kc.description as category_description
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND (
          LOWER(kb.keywords) LIKE CONCAT('%', ?, '%')
          OR LOWER(kb.question) LIKE CONCAT('%', ?, '%')
          OR LOWER(kb.answer) LIKE CONCAT('%', ?, '%')
        )
        ORDER BY 
          CASE 
            WHEN LOWER(kb.keywords) LIKE CONCAT('%', ?, '%') THEN 1
            WHEN LOWER(kb.question) LIKE CONCAT('%', ?, '%') THEN 2
            ELSE 3
          END,
          kb.priority DESC, 
          kb.id ASC
        LIMIT 1
      `, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);
      
      if (rows && rows.length > 0) {
        console.log(`✅ Found match: [${rows[0].category_name}] ${rows[0].question}`);
        return rows[0];
      }
      
      console.log('❌ No match found in searchByKeywords');
      return null;
    } catch (error) {
      console.error('❌ Error in searchByKeywords:', error);
      return null;
    }
  }

  // 개별 키워드로 더 정확한 매칭 검색
  async searchByIndividualKeywords(userMessage) {
    try {
      console.log(`🔍 Individual keyword search: "${userMessage}"`);
      
      // 사용자 메시지에서 키워드 추출 (2글자 이상, 한글/영문)
      const userKeywords = userMessage.toLowerCase()
        .replace(/[^\w\sㄱ-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 2);
      
      if (userKeywords.length === 0) {
        console.log('❌ No valid keywords found');
        return null;
      }
      
      console.log(`📝 Extracted keywords: ${userKeywords.join(', ')}`);
      
      // 각 키워드가 포함된 항목 검색
      const keywordLikes = userKeywords.map(() => 'LOWER(kb.keywords) LIKE CONCAT("%", ?, "%")').join(' + ');
      const keywordOrs = userKeywords.map(() => 'LOWER(kb.keywords) LIKE CONCAT("%", ?, "%")').join(' OR ');
      
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name,
          (${keywordLikes}) as match_count
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND (${keywordOrs})
        ORDER BY match_count DESC, kb.priority DESC
        LIMIT 1
      `, [...userKeywords, ...userKeywords]);
      
      if (rows && rows.length > 0) {
        console.log(`✅ Found match: [${rows[0].category_name}] ${rows[0].question} (score: ${rows[0].match_count})`);
        return rows[0];
      }
      
      console.log('❌ No match found in searchByIndividualKeywords');
      return null;
    } catch (error) {
      console.error('❌ Error in searchByIndividualKeywords:', error);
      return null;
    }
  }

  // 단순 텍스트 매칭 (가장 관대한 검색)
  async searchBySimpleText(userMessage) {
    try {
      console.log(`🔍 Simple text search: "${userMessage}"`);
      
      const searchQuery = userMessage.toLowerCase().trim();
      
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND (
          LOWER(CONCAT(kb.keywords, ' ', kb.question, ' ', kb.answer)) LIKE CONCAT('%', ?, '%')
        )
        ORDER BY 
          CASE 
            WHEN LOWER(kb.question) LIKE CONCAT('%', ?, '%') THEN 1
            WHEN LOWER(kb.keywords) LIKE CONCAT('%', ?, '%') THEN 2
            ELSE 3
          END,
          kb.priority DESC
        LIMIT 1
      `, [searchQuery, searchQuery, searchQuery]);
      
      if (rows && rows.length > 0) {
        console.log(`✅ Found match: [${rows[0].category_name}] ${rows[0].question}`);
        return rows[0];
      }
      
      console.log('❌ No match found in searchBySimpleText');
      return null;
    } catch (error) {
      console.error('❌ Error in searchBySimpleText:', error);
      return null;
    }
  }

  // 통합 검색 (모든 방법을 순차적으로 시도)
  async searchBestMatch(userMessage) {
    try {
      console.log(`🎯 Starting comprehensive search: "${userMessage}"`);
      
      // 1단계: 개별 키워드 검색
      let result = await this.searchByIndividualKeywords(userMessage);
      if (result) {
        console.log('✅ Found in stage 1 (Individual keywords)');
        return result;
      }
      
      // 2단계: 기본 키워드 검색
      result = await this.searchByKeywords(userMessage);
      if (result) {
        console.log('✅ Found in stage 2 (Basic keywords)');
        return result;
      }
      
      // 3단계: 단순 텍스트 매칭
      result = await this.searchBySimpleText(userMessage);
      if (result) {
        console.log('✅ Found in stage 3 (Simple text)');
        return result;
      }
      
      console.log('❌ No match found in any search strategy');
      return null;
    } catch (error) {
      console.error('❌ Error in searchBestMatch:', error);
      return null;
    }
  }

  // 데이터베이스 연결 및 데이터 확인
  async testConnection() {
    try {
      console.log('🔌 Testing database connection...');
      const [rows] = await pool.query('SELECT 1 as test');
      console.log('✅ Database connection successful');
      
      // 테이블 존재 확인
      const [tables] = await pool.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('knowledge_base', 'knowledge_categories')
      `, [process.env.DB_DATABASE]);
      
      console.log(`📋 Found tables: ${tables.map(t => t.TABLE_NAME).join(', ')}`);
      
      if (tables.length < 2) {
        console.log('❌ Knowledge base tables not found');
        return false;
      }
      
      // 데이터 존재 확인
      const [dataRows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE AND kc.is_active = TRUE
      `);
      
      console.log(`📊 Active knowledge base entries: ${dataRows[0].count}`);
      
      if (dataRows[0].count === 0) {
        console.log('⚠️ No active knowledge base entries found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // 모든 지식베이스 항목 조회
  async getAllKnowledge() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        ORDER BY kc.id, kb.priority DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting all knowledge:', error);
      return [];
    }
  }

  // 카테고리별 지식베이스 조회
  async getKnowledgeByCategory(categoryId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.category_id = ? 
        AND kb.is_active = TRUE 
        AND kc.is_active = TRUE
        ORDER BY kb.priority DESC
      `, [categoryId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting knowledge by category:', error);
      return [];
    }
  }

  // 새 지식베이스 항목 추가
  async addKnowledge(categoryId, keywords, question, answer, priority = 1) {
    try {
      const [result] = await pool.query(`
        INSERT INTO knowledge_base (category_id, keywords, question, answer, priority)
        VALUES (?, ?, ?, ?, ?)
      `, [categoryId, keywords, question, answer, priority]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error adding knowledge:', error);
      throw error;
    }
  }

  // 지식베이스 항목 업데이트
  async updateKnowledge(id, data) {
    try {
      const { keywords, question, answer, priority } = data;
      const [result] = await pool.query(`
        UPDATE knowledge_base 
        SET keywords = ?, question = ?, answer = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [keywords, question, answer, priority, id]);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating knowledge:', error);
      throw error;
    }
  }

  // 채팅 분석 로그 저장
  async logChatAnalytics(userMessage, botResponse, matchedKnowledgeId = null, responseTime = 0) {
    try {
      const [result] = await pool.query(`
        INSERT INTO chat_analytics (user_message, bot_response, matched_knowledge_id, response_time_ms)
        VALUES (?, ?, ?, ?)
      `, [userMessage, botResponse, matchedKnowledgeId, responseTime]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error logging chat analytics:', error);
      // 분석 로그 실패는 전체 프로세스를 중단시키지 않음
    }
  }
}

module.exports = new ChatbotDao();