/**
 * Visual Search Helper - Fast HTTP-based version
 * Uses persistent Flask server that keeps model in memory
 * Much faster than spawning Python each time!
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

// Server configuration
const VISUAL_SEARCH_SERVER_URL = process.env.VISUAL_SEARCH_URL || 'http://localhost:5001';

class VisualSearchHelper {
    constructor() {
        this.serverUrl = VISUAL_SEARCH_SERVER_URL;
        this.pythonScript = path.join(__dirname, '..', 'ai_models', 'visual_search.py');
        this.serverScript = path.join(__dirname, '..', 'ai_models', 'visual_search_server.py');
        this.serverProcess = null;
        this.isServerRunning = false;
    }

    /**
     * Start the visual search server if not running
     */
    async ensureServerRunning() {
        if (this.isServerRunning) return true;

        try {
            // Check if server is already running
            const response = await this.httpRequest('/health', 'GET');
            if (response.success) {
                this.isServerRunning = true;
                console.log('✅ Visual search server already running');
                return true;
            }
        } catch (e) {
            // Server not running, start it
            console.log('🔄 Starting visual search server...');
            this.startServer();

            // Wait for server to be ready (max 60 seconds for model loading)
            for (let i = 0; i < 60; i++) {
                await this.sleep(1000);
                try {
                    const response = await this.httpRequest('/health', 'GET');
                    if (response.success) {
                        this.isServerRunning = true;
                        console.log('✅ Visual search server ready!');
                        return true;
                    }
                } catch (err) {
                    // Still starting up
                }
            }
        }
        return false;
    }

    /**
     * Start the Flask server as a background process
     */
    startServer() {
        const pythonCmd = this.findPython();
        const args = pythonCmd === 'py' ? ['-3.12', this.serverScript] : [this.serverScript];

        this.serverProcess = spawn(pythonCmd, args, {
            detached: true,
            stdio: 'ignore'
        });

        this.serverProcess.unref();
    }

    /**
     * Find Python executable - use explicit path to avoid conflicts
     */
    findPython() {
        // Use explicit path to avoid MySQL Workbench Python conflict
        const explicitPath = process.env.PYTHON_PATH || 'C:\\Users\\AH\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
        const fs = require('fs');
        if (fs.existsSync(explicitPath)) {
            return explicitPath;
        }
        try {
            execSync('py -3.12 --version', { stdio: 'pipe' });
            return 'py';
        } catch (e) {
            return 'python';
        }
    }

    /**
     * Make HTTP request to the server
     */
    async httpRequest(endpoint, method = 'POST', data = null) {
        const url = `${this.serverUrl}${endpoint}`;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return new Promise((resolve, reject) => {
            const http = require('http');
            const urlObj = new URL(url);

            const req = http.request({
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error(`Invalid JSON response: ${body}`));
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(120000, () => reject(new Error('Request timeout')));

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if visual search is available
     */
    async checkHealth() {
        try {
            await this.ensureServerRunning();
            const result = await this.httpRequest('/health', 'GET');
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Visual search server not available'
            };
        }
    }

    /**
     * Extract features from an image (uses HTTP - FAST!)
     */
    async extractFeatures(imageData) {
        await this.ensureServerRunning();

        const result = await this.httpRequest('/extract', 'POST', {
            image: imageData
        });

        if (!result.success) {
            throw new Error(result.error || 'Feature extraction failed');
        }

        return result.features;
    }

    /**
     * Calculate cosine similarity between two vectors (pure JS, instant!)
     */
    cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) {
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Legacy method - fallback for old code paths
     */
    async findSimilarProducts(queryImage, products, topN = 10) {
        // Extract query features
        const queryFeatures = await this.extractFeatures(queryImage);

        // For each product, extract features and compare
        const results = [];
        for (const product of products) {
            try {
                const productFeatures = await this.extractFeatures(product.imageUrl);
                const similarity = this.cosineSimilarity(queryFeatures, productFeatures);
                results.push({
                    productId: product.productId,
                    similarity: similarity
                });
            } catch (e) {
                // Skip failed products
            }
        }

        // Sort by similarity
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, topN);
    }
}

module.exports = VisualSearchHelper;
