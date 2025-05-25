const pool = require('../config/database');

class KnowledgeDao {
  // 키워드로 지식베이스 검색
  async searchByKeywords(userMessage) {
    try {
      // 사용자 메시지를 소문자로 변환
      const lowerMessage = userMessage.toLowerCase();
      
      // 키워드가 포함된 지식베이스 항목을 우선순위 순으로 조회
      const query = `
        SELECT kb.*, kc.name as category_name
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
          AND kc.is_active = TRUE
          AND LOWER(kb.keywords) LIKE ?
        ORDER BY kb.priority DESC
        LIMIT 5
      `;
      
      const [rows] = await pool.query(query, [`%${lowerMessage}%`]);
      
      // 키워드가 정확히 일치하는 경우 더 높은 점수 부여
      const scoredResults = rows.map(row => {
        const keywords = row.keywords.toLowerCase().split(',').map(k => k.trim());
        let score = row.priority;
        
        // 각 키워드에 대해 점수 계산
        keywords.forEach(keyword => {
          if (lowerMessage.includes(keyword)) {
            score += 10; // 키워드 포함 시 가산점
            if (lowerMessage === keyword) {
              score += 50; // 정확히 일치 시 높은 가산점
            }
          }
        });
        
        return { ...row, score };
      });
      
      // 점수 순으로 정렬
      scoredResults.sort((a, b) => b.score - a.score);
      
      return scoredResults;
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

  // 단어별 매칭 검색 (향상된 검색)
  async searchByWords(userMessage) {
    try {
      const words = userMessage.toLowerCase().split(' ').filter(word => word.length > 1);
      
      if (words.length === 0) return [];
      
      // 각 단어에 대해 LIKE 조건 생성
      const conditions = words.map(() => 'LOWER(kb.keywords) LIKE ?').join(' OR ');
      const params = words.map(word => `%${word}%`);
      
      const query = `
        SELECT kb.*, kc.name as category_name,
          (
            ${words.map((_, index) => 
              `CASE WHEN LOWER(kb.keywords) LIKE ? THEN 1 ELSE 0 END`
            ).join(' + ')}
          ) as match_count
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
          AND kc.is_active = TRUE
          AND (${conditions})
        ORDER BY match_count DESC, kb.priority DESC
        LIMIT 5
      `;
      
      // 파라미터 배열: match_count 계산용 + WHERE 조건용
      const allParams = [...params, ...params];
      const [rows] = await pool.query(query, allParams);
      
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
}

module.exports = new KnowledgeDao();