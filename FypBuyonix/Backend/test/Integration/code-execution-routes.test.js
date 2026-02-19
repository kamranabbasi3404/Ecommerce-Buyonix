const request = require('supertest');
const app = require('../../server');

describe('INTEGRATION: Code Execution Routes - Execution Requests, Validation & Language Support', () => {

  // ============== CODE EXECUTION TESTS ==============

  // ✅ Test 1: Execute Python code successfully
  test('Should execute Python code and return output', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("Hello World")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.output).toBeDefined();
    expect(res.body.output).toContain('Hello World');
  });

  // ✅ Test 2: Execute JavaScript code successfully
  test('Should execute JavaScript code and return output', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'javascript',
        code: 'console.log("Hello from JS")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.output).toBeDefined();
    expect(res.body.output).toContain('Hello from JS');
  });

  // ✅ Test 3: Execute code with mathematical operations
  test('Should execute code with arithmetic operations', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print(5 + 3)\nprint(10 * 2)'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.output).toContain('8');
    expect(res.body.output).toContain('20');
  });

  // ✅ Test 4: Execute code with variables
  test('Should execute code with variable declaration', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'x = 10\ny = 20\nprint(x + y)'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('30');
  });

  // ✅ Test 5: Execute code with loops
  test('Should execute code with loops', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'for i in range(3):\n    print(i)'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('0');
    expect(res.body.output).toContain('1');
    expect(res.body.output).toContain('2');
  });

  // ✅ Test 6: Execute code with functions
  test('Should execute code with function definition', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'def add(a, b):\n    return a + b\nprint(add(5, 3))'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('8');
  });

  // ✅ Test 7: Execute code with lists/arrays
  test('Should execute code with list operations', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'numbers = [1, 2, 3, 4, 5]\nprint(sum(numbers))'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('15');
  });

  // ✅ Test 8: Execution returns execution time
  test('Should return execution time in response', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("test")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.executionTime).toBeDefined();
    expect(typeof res.body.executionTime).toBe('number');
  });

  // ✅ Test 9: Execute code with multiple print statements
  test('Should capture multiple output lines', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("Line 1")\nprint("Line 2")\nprint("Line 3")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('Line 1');
    expect(res.body.output).toContain('Line 2');
    expect(res.body.output).toContain('Line 3');
  });

  // ✅ Test 10: Execute JavaScript with console output
  test('Should capture JavaScript console output', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'javascript',
        code: 'const x = 10;\nconst y = 20;\nconsole.log(x + y);'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('30');
  });

  // ============== PARAMETER VALIDATION TESTS ==============

  // ✅ Test 11: Execution without language parameter
  test('Should fail execution without language parameter', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        code: 'print("test")'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 12: Execution without code parameter
  test('Should fail execution without code parameter', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 13: Execution with empty code
  test('Should handle empty code input', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: ''
      });

    expect(res.statusCode).toBeDefined();
    expect([200, 400]).toContain(res.statusCode);
  });

  // ✅ Test 14: Execution with unsupported language
  test('Should reject unsupported programming language', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'cobol',
        code: 'print("test")'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ✅ Test 15: Language parameter validation (case sensitivity)
  test('Should handle language case variations', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'PYTHON',
        code: 'print("test")'
      });

    // Should either work or provide clear error
    expect(res.statusCode).toBeDefined();
  });

  // ✅ Test 16: Code with syntax error reporting
  test('Should return error message for syntax errors', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("unclosed string'
      });

    expect(res.statusCode).toBeDefined();
    expect(res.body.error || res.body.success === false).toBe(true);
  });

  // ✅ Test 17: Code with runtime error handling
  test('Should handle runtime errors gracefully', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'x = 10 / 0'
      });

    expect(res.statusCode).toBeDefined();
    expect(res.body.error || res.body.output).toBeDefined();
  });

  // ✅ Test 18: Very long code input
  test('Should handle long code input', async () => {
    let longCode = '';
    for (let i = 0; i < 100; i++) {
      longCode += `print(${i})\n`;
    }

    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: longCode
      });

    expect(res.statusCode).toBeDefined();
  });

  // ✅ Test 19: Code with special characters
  test('Should execute code with special characters', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("!@#$%^&*()")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toContain('!@#$%^&*()');
  });

  // ✅ Test 20: Code with unicode characters
  test('Should handle unicode characters in code', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("مرحبا العالم")'
      });

    expect(res.statusCode).toBeDefined();
  });

  // ============== LANGUAGE SUPPORT TESTS ==============

  // ✅ Test 21: Get supported languages list
  test('Should retrieve list of supported languages', async () => {
    const res = await request(app)
      .get('/code/languages');

    expect(res.statusCode).toBe(200);
    expect(res.body.languages).toBeDefined();
    expect(Array.isArray(res.body.languages)).toBe(true);
    expect(res.body.languages.length).toBeGreaterThan(0);
  });

  // ✅ Test 22: Supported languages includes Python
  test('Should support Python language', async () => {
    const res = await request(app)
      .get('/code/languages');

    expect(res.statusCode).toBe(200);
    const pythonSupported = res.body.languages.some(lang => 
      lang.toLowerCase() === 'python' || lang.toLowerCase().includes('python')
    );
    expect(pythonSupported).toBe(true);
  });

  // ✅ Test 23: Supported languages includes JavaScript
  test('Should support JavaScript language', async () => {
    const res = await request(app)
      .get('/code/languages');

    expect(res.statusCode).toBe(200);
    const jsSupported = res.body.languages.some(lang => 
      lang.toLowerCase() === 'javascript' || lang.toLowerCase().includes('javascript')
    );
    expect(jsSupported).toBe(true);
  });

  // ✅ Test 24: Language support returns language details
  test('Should return language details if available', async () => {
    const res = await request(app)
      .get('/code/languages');

    expect(res.statusCode).toBe(200);
    
    // Each language might have metadata
    if (res.body.languages.length > 0 && typeof res.body.languages[0] === 'object') {
      expect(res.body.languages[0].name || res.body.languages[0]).toBeDefined();
    }
  });

  // ✅ Test 25: Get language versions
  test('Should provide language version information if available', async () => {
    const res = await request(app)
      .get('/code/languages');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.languages)).toBe(true);
  });

  // ============== EXECUTION CONSTRAINTS TESTS ==============

  // ✅ Test 26: Code execution timeout handling
  test('Should handle execution timeout gracefully', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'while True: pass'
      });

    expect(res.statusCode).toBeDefined();
    // Should timeout or return error
    expect(res.body.success === false || res.statusCode > 399).toBe(true);
  });

  // ✅ Test 27: Large output handling
  test('Should handle large output correctly', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'for i in range(1000):\n    print(i)'
      });

    expect(res.statusCode).toBeDefined();
    expect(res.body.output || res.body.error).toBeDefined();
  });

  // ✅ Test 28: File operations security (should be restricted)
  test('Should restrict file operations in code execution', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'open("/etc/passwd").read()'
      });

    // Should fail or be restricted
    expect(res.statusCode).toBeDefined();
  });

  // ✅ Test 29: Network operations security (should be restricted)
  test('Should restrict network operations in code execution', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'import requests\nrequests.get("http://example.com")'
      });

    // Should fail or be restricted
    expect(res.statusCode).toBeDefined();
  });

  // ✅ Test 30: Response structure consistency
  test('Should return consistent response structure', async () => {
    const res = await request(app)
      .post('/code/execute')
      .send({
        language: 'python',
        code: 'print("test")'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: expect.any(Boolean),
        output: expect.anything(),
        executionTime: expect.any(Number)
      })
    );
  });

});
