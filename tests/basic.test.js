const assert = require('assert');
const app = require('../app');

async function run() {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // Test /health endpoint
    let res = await fetch(`http://localhost:${port}/health`);
    assert.strictEqual(res.status, 200, '/health should return 200');
    let data = await res.json();
    assert.strictEqual(data.status, 'OK');

    // Test root endpoint
    res = await fetch(`http://localhost:${port}/`);
    assert.strictEqual(res.status, 200, 'root should return 200');
    data = await res.json();
    assert.strictEqual(data.status, 'running');

    // Test 404
    res = await fetch(`http://localhost:${port}/nope`);
    assert.strictEqual(res.status, 404, 'unknown route should return 404');

    console.log('All tests passed');
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
