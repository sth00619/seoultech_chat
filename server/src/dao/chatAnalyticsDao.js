const BaseDao = require("./baseDao");

class ChatAnalyticsDao extends BaseDao {
  constructor(body) {
    super(body);
    this.body = body;
  }

  // 채팅 분석 로그 저장
  async logChatAnalytics(userMessage, botResponse, matchedKnowledgeId = null, responseTime = 0) {
    try {
      this.query = `
        INSERT INTO chat_analytics (user_message, bot_response, matched_knowledge_id, response_time_ms)
        VALUES (:userMessage, :botResponse, :matchedKnowledgeId, :responseTime)
      `;

      this.param = {
        userMessage,
        botResponse,
        matchedKnowledgeId,
        responseTime
      };

      const result = await this.insertQuery();
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  // 채팅 분석 데이터 조회
  async getChatAnalytics(limit = 100, offset = 0) {
    try {
      this.query = `
        SELECT 
          ca.*,
          kb.question as matched_question,
          kb.category_id,
          kc.name as category_name
        FROM chat_analytics ca
        LEFT JOIN knowledge_base kb ON ca.matched_knowledge_id = kb.id
        LEFT JOIN knowledge_categories kc ON kb.category_id = kc.id
        ORDER BY ca.created_at DESC
        LIMIT :limit OFFSET :offset
      `;

      this.param = {
        limit,
        offset
      };

      return await this.selectQuery();
    } catch (err) {
      throw err;
    }
  }

  // 사용자 피드백 업데이트
  async updateUserFeedback(id, feedback) {
    try {
      this.query = `
        UPDATE chat_analytics 
        SET user_feedback = :feedback 
        WHERE id = :id
      `;

      this.param = {
        id,
        feedback
      };

      return await this.modifyQuery();
    } catch (err) {
      throw err;
    }
  }

  // 응답 시간 통계
  async getResponseTimeStats() {
    try {
      this.query = `
        SELECT 
          AVG(response_time_ms) as avg_response_time,
          MIN(response_time_ms) as min_response_time,
          MAX(response_time_ms) as max_response_time,
          COUNT(*) as total_queries
        FROM chat_analytics
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;

      this.param = {};

      const result = await this.selectQuery();
      return result && result.length > 0 ? result[0] : null;
    } catch (err) {
      throw err;
    }
  }

  // 카테고리별 질문 분석
  async getCategoryStats() {
    try {
      this.query = `
        SELECT 
          kc.name as category_name,
          COUNT(*) as question_count,
          AVG(ca.response_time_ms) as avg_response_time
        FROM chat_analytics ca
        JOIN knowledge_base kb ON ca.matched_knowledge_id = kb.id
        JOIN knowledge_categories kc ON kb.category_id = kc.id
        WHERE ca.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY kc.id, kc.name
        ORDER BY question_count DESC
      `;

      this.param = {};

      return await this.selectQuery();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ChatAnalyticsDao;