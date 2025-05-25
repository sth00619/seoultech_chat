const pool = require('../config/database');

class KnowledgeDao {
  // 키워드를 기반으로 지식베이스에서 답변 검색
  async searchByKeywords(userMessage) {
    try {
      // 사용자 메시지를 소문자로 변환하여 검색
      const searchQuery = userMessage.toLowerCase();
      
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
          ? REGEXP REPLACE(kb.keywords, ',', '|')
          OR LOWER(kb.question) LIKE CONCAT('%', ?, '%')
          OR LOWER(kb.answer) LIKE CONCAT('%', ?, '%')
        )
        ORDER BY kb.priority DESC, kb.id ASC
        LIMIT 1
      `, [searchQuery, searchQuery, searchQuery]);
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return null;
    }
  }

  // 정확한 키워드 매칭으로 답변 검색
  async searchByExactKeywords(userMessage) {
    try {
      const searchQuery = userMessage.toLowerCase();
      
      // 키워드를 개별적으로 확인
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name,
          (
            LENGTH(kb.keywords) - LENGTH(REPLACE(LOWER(kb.keywords), ?, ''))
          ) as match_score
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND LOWER(kb.keywords) LIKE CONCAT('%', ?, '%')
        ORDER BY match_score DESC, kb.priority DESC
        LIMIT 3
      `, [searchQuery, searchQuery]);
      
      return rows;
    } catch (error) {
      console.error('Error in exact keyword search:', error);
      return [];
    }
  }

  // 키워드별 개별 검색 (더 정확한 매칭)
  async searchByIndividualKeywords(userMessage) {
    try {
      const keywords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 1);
      
      if (keywords.length === 0) return null;
      
      // 각 키워드에 대해 검색
      const keywordConditions = keywords.map(() => 
        'FIND_IN_SET(?, REPLACE(LOWER(kb.keywords), " ", "")) > 0'
      ).join(' OR ');
      
      const [rows] = await pool.query(`
        SELECT 
          kb.*,
          kc.name as category_name,
          (${keywords.map(() => 'FIND_IN_SET(?, REPLACE(LOWER(kb.keywords), " ", ""))').join(' + ')}) as match_count
        FROM knowledge_base kb
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE kb.is_active = TRUE 
        AND kc.is_active = TRUE
        AND (${keywordConditions})
        ORDER BY match_count DESC, kb.priority DESC
        LIMIT 1
      `, [...keywords, ...keywords]);
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error in individual keyword search:', error);
      return null;
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

  // 기본 응답 메시지들
  getDefaultResponses() {
    return [
      `죄송합니다. 정확한 답변을 찾지 못했어요. 😅\n\n다음과 같은 주제로 질문해보시는 건 어떨까요?\n\n• 학교 소개 및 전공 정보\n• 입학 및 취업 정보\n• 캠퍼스 생활 및 시설\n• 학사 일정 및 장학금\n\n더 구체적으로 질문해주시면 정확한 답변을 드릴 수 있어요!`,
      
      `아직 해당 질문에 대한 정보가 준비되어 있지 않아요. 🤔\n\n**대신 이런 질문들을 시도해보세요:**\n• "서울과기대에 대해 알려주세요"\n• "컴퓨터공학과 정보가 궁금해요"\n• "입학 정보를 알려주세요"\n• "취업률이 어떻게 되나요?"\n\n더 많은 정보가 필요하시면 학교 홈페이지(www.seoultech.ac.kr)를 참고해주세요!`,
      
      `흥미로운 질문이네요! 하지만 정확한 정보를 찾지 못했습니다. 😊\n\n**서울과학기술대학교 관련 질문이라면:**\n• 학과/전공 관련 질문\n• 입학/진학 상담\n• 취업/진로 정보\n• 캠퍼스 생활 정보\n\n이런 주제들로 다시 질문해주시면 도움을 드릴 수 있어요!`
    ];
  }
}

module.exports = new KnowledgeDao();