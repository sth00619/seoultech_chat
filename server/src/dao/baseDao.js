const DBBaseModule = require("../modules/DBBaseModule");

class BaseDao {
  constructor(body) {
    this.body = body;
    this.query = "";
    this.param = {};
    this.db = DBBaseModule;
  }

  // SELECT 쿼리 실행
  async selectQuery() {
    try {
      const result = await this.db.queryByJson(this.query, this.param);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // INSERT 쿼리 실행
  async insertQuery() {
    try {
      const result = await this.db.queryByJson(this.query, this.param);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // UPDATE 쿼리 실행
  async modifyQuery() {
    try {
      const result = await this.db.queryByJson(this.query, this.param);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // DELETE 쿼리 실행
  async deleteQuery() {
    try {
      const result = await this.db.queryByJson(this.query, this.param);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 트랜잭션을 사용한 쿼리 실행
  async executeWithTransaction(queries, useTransaction = true) {
    try {
      const result = await this.db.executeQueries(queries, this.param, useTransaction);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = BaseDao;