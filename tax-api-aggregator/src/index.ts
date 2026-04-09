import type { Env } from './types';
import { handleRequest } from './router';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 添加请求日志
    const startTime = Date.now();
    const url = new URL(request.url);
    
    console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);

    try {
      const response = await handleRequest(request, env);
      
      // 记录响应时间
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname} - ${response.status} (${duration}ms)`);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] Error: ${errorMessage}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};