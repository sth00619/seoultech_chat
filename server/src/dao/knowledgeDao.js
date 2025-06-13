const pool = require('../config/database');

class KnowledgeDao {
  // 메시지 정규화 헬퍼 메서드
  normalizeMessage(message) {
    // 특수문자 제거, 공백 정리, 소문자 변환
    return message
      .toLowerCase()
      .replace(/[^가-힣a-z0-9\s]/g, ' ')  // 특수문자를 공백으로
      .replace(/\s+/g, ' ')               // 연속 공백을 하나로
      .trim();
  }

  // 키워드로 지식베이스 검색 (개선된 버전)
  async searchByKeywords(userMessage) {
    try {
      // 메시지 정규화
      const cleanedMessage = this.normalizeMessage(userMessage);
      
      // 개선된 검색 쿼리
      const query = `
        SELECT kb.*, kc.name as category_name,
          (
            -- 전체 메시지에서 키워드 매칭
            CASE 
              WHEN LOWER(?) LIKE CONCAT('%', LOWER(kb.keywords), '%') THEN 20
              ELSE 0
            END +
            -- 개별 키워드 매칭 점수
            (
              SELECT COUNT(*)
              FROM (
                SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', numbers.n), ',', -1)) as keyword
                FROM (
                  SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
                ) numbers
                WHERE numbers.n <= 1 + (LENGTH(kb.keywords) - LENGTH(REPLACE(kb.keywords, ',', '')))
              ) as split_keywords
              WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(split_keywords.keyword)), '%')
            ) * 10 +
            -- 우선순위 점수
            kb.priority
          ) as score
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
          AND kc.is_active = TRUE
          AND (
            -- 키워드가 메시지에 포함되어 있는지 확인
            LOWER(?) LIKE CONCAT('%', LOWER(SUBSTRING_INDEX(kb.keywords, ',', 1)), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 2), ',', -1))), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 3), ',', -1))), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 4), ',', -1))), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 5), ',', -1))), '%')
          )
        ORDER BY score DESC, kb.priority DESC
        LIMIT 5
      `;
      
      const params = [
        cleanedMessage,  // for full message matching
        cleanedMessage,  // for individual keyword counting
        cleanedMessage,  // WHERE condition 1
        cleanedMessage,  // WHERE condition 2
        cleanedMessage,  // WHERE condition 3
        cleanedMessage,  // WHERE condition 4
        cleanedMessage   // WHERE condition 5
      ];
      
      const [rows] = await pool.query(query, params);
      
      console.log(`Keyword search for "${userMessage}":`, rows.length > 0 ? `Found ${rows.length} matches` : 'No matches');
      
      return rows;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  // 카테고리별 지식베이스 조회
  async getByCategory(categoryId) {
    const query = `
      SELECT kb.*, kc.name as category_name
      FROM knowledge_base kb
      JOIN knowledge_categories kc ON kb.category_id = kc.id
      WHERE kb.category_id = ? 
        AND kb.is_active = TRUE
        AND kc.is_active = TRUE
      ORDER BY kb.priority DESC
    `;
    
    const [rows] = await pool.query(query, [categoryId]);
    return rows;
  }

  // 모든 카테고리 조회
  async getAllCategories() {
    const [rows] = await pool.query(
      'SELECT * FROM knowledge_categories WHERE is_active = TRUE ORDER BY id'
    );
    return rows;
  }

  // 채팅 분석 로그 저장
  async logChatAnalytics(userMessage, botResponse, matchedKnowledgeId = null, responseTimeMs = 0) {
    const query = `
      INSERT INTO chat_analytics 
      (user_message, bot_response, matched_knowledge_id, response_time_ms) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      userMessage, 
      botResponse, 
      matchedKnowledgeId, 
      responseTimeMs
    ]);
    
    return result.insertId;
  }

  // 단어별 매칭 검색 (개선된 버전)
  async searchByWords(userMessage) {
    try {
      // 메시지 정규화
      const normalizedMessage = this.normalizeMessage(userMessage);
      const words = normalizedMessage.split(' ').filter(word => word.length > 1);
      
      if (words.length === 0) return [];
      
      // 각 단어와 전체 메시지에 대한 검색
      const query = `
        SELECT kb.*, kc.name as category_name,
          (
            -- 전체 메시지가 keywords에 있는 단어를 포함하는지
            (
              SELECT COUNT(*)
              FROM (
                SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', numbers.n), ',', -1)) as keyword
                FROM (
                  SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
                ) numbers
                WHERE numbers.n <= 1 + (LENGTH(kb.keywords) - LENGTH(REPLACE(kb.keywords, ',', '')))
              ) as split_keywords
              WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(split_keywords.keyword)), '%')
            ) * 10 +
            -- 개별 단어 매칭
            ${words.map(() => 
              `CASE WHEN LOWER(kb.keywords) LIKE CONCAT('%', LOWER(?), '%') THEN 2 ELSE 0 END`
            ).join(' + ')} +
            -- 질문에서의 매칭
            ${words.map(() => 
              `CASE WHEN LOWER(kb.question) LIKE CONCAT('%', LOWER(?), '%') THEN 1 ELSE 0 END`
            ).join(' + ')} +
            -- 우선순위
            kb.priority
          ) as match_score
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
          AND kc.is_active = TRUE
          AND (
            -- 키워드나 질문에 단어가 포함되어 있는지
            ${words.map(() => 'LOWER(kb.keywords) LIKE CONCAT("%", LOWER(?), "%")').join(' OR ')} OR
            ${words.map(() => 'LOWER(kb.question) LIKE CONCAT("%", LOWER(?), "%")').join(' OR ')} OR
            -- 전체 메시지에서 키워드 확인
            LOWER(?) LIKE CONCAT('%', LOWER(SUBSTRING_INDEX(kb.keywords, ',', 1)), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 2), ',', -1))), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 3), ',', -1))), '%') OR
            LOWER(?) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', 4), ',', -1))), '%')
          )
        ORDER BY match_score DESC, kb.priority DESC
        LIMIT 5
      `;
      
      // 파라미터 배열 구성
      const params = [
        normalizedMessage,  // 전체 메시지 매칭용
        ...words,          // 개별 단어 매칭 (keywords)
        ...words,          // 개별 단어 매칭 (question)
        ...words,          // WHERE 조건 (keywords)
        ...words,          // WHERE 조건 (question)
        normalizedMessage, // 전체 메시지 키워드 확인 1
        normalizedMessage, // 전체 메시지 키워드 확인 2
        normalizedMessage, // 전체 메시지 키워드 확인 3
        normalizedMessage  // 전체 메시지 키워드 확인 4
      ];
      
      const [rows] = await pool.query(query, params);
      
      console.log(`Word search for "${userMessage}":`, rows.length > 0 ? `Found ${rows.length} matches` : 'No matches');
      
      return rows;
    } catch (error) {
      console.error('Error in word-based search:', error);
      throw error;
    }
  }

  // 특정 질문에 대한 정확한 답변 조회
  async getExactAnswer(question) {
    const query = `
      SELECT kb.*, kc.name as category_name
      FROM knowledge_base kb
      JOIN knowledge_categories kc ON kb.category_id = kc.id
      WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND LOWER(kb.question) = LOWER(?)
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [question]);
    return rows[0];
  }

  // 유사도 기반 검색 (추가 메서드)
  async searchBySimilarity(userMessage) {
    try {
      const normalizedMessage = this.normalizeMessage(userMessage);
      
      // 핵심 키워드 추출 (2글자 이상)
      const keywords = normalizedMessage.split(' ')
        .filter(word => word.length >= 2)
        .slice(0, 5); // 최대 5개 키워드만 사용
      
      if (keywords.length === 0) return [];
      
      const query = `
        SELECT kb.*, kc.name as category_name,
          (
            SELECT COUNT(*)
            FROM (
              SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(kb.keywords, ',', numbers.n), ',', -1)) as keyword
              FROM (
                SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
              ) numbers
              WHERE numbers.n <= 1 + (LENGTH(kb.keywords) - LENGTH(REPLACE(kb.keywords, ',', '')))
            ) as split_keywords
            WHERE ${keywords.map(() => 'LOWER(TRIM(split_keywords.keyword)) = LOWER(?)').join(' OR ')}
          ) as exact_match_count
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
          AND kc.is_active = TRUE
        HAVING exact_match_count > 0
        ORDER BY exact_match_count DESC, kb.priority DESC
        LIMIT 3
      `;
      
      const [rows] = await pool.query(query, keywords);
      return rows;
    } catch (error) {
      console.error('Error in similarity search:', error);
      return [];
    }
  }

  // 통합 검색 메서드 (모든 검색 방법을 순차적으로 시도)
  async searchAnswer(userMessage) {
    try {
      console.log('Searching for:', userMessage);
      
      // 1. 먼저 정확한 질문 매칭 시도
      const exactMatch = await this.getExactAnswer(userMessage);
      if (exactMatch) {
        console.log('Exact match found:', exactMatch.id);
        return exactMatch;
      }
      
      // 2. 키워드 기반 검색 (개선된 버전)
      const keywordResults = await this.searchByKeywords(userMessage);
      if (keywordResults.length > 0) {
        console.log('Keyword match found:', keywordResults[0].id);
        return keywordResults[0];
      }
      
      // 3. 단어별 매칭 검색 (개선된 버전)
      const wordResults = await this.searchByWords(userMessage);
      if (wordResults.length > 0) {
        console.log('Word match found:', wordResults[0].id);
        return wordResults[0];
      }ㅁ
      
      // 4. 유사도 기반 검색
      const similarResults = await this.searchBySimilarity(userMessage);
      if (similarResults.length > 0) {
        console.log('Similar match found:', similarResults[0].id);
        return similarResults[0];
      }
      
      console.log('No match found');
      return null;
    } catch (error) {
      console.error('Error in searchAnswer:', error);
      throw error;
    }
  }
}

module.exports = new KnowledgeDao();