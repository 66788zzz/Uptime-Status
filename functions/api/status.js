/**
 * API 代理实现
 * 适配 UptimeRobot API v3（添加 Basic Auth 认证）
 */

export async function onRequest(context) {
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }

  // 处理 OPTIONS 请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 从环境变量获取 API 密钥（关键：API v3 必须配置）
    const apiKey = context.env.UPTIMEROBOT_API_KEY;
    if (!apiKey) {
      return new Response('未配置 API 密钥', { status: 500 })
    }

    // 生成 Basic Auth 头（API v3 要求：格式为 "api_key:" 编码为 Base64）
    const authString = `${apiKey}:`; // 注意末尾的冒号不能省略
    const base64Auth = btoa(authString); // 编码为 Base64
    const authHeader = `Basic ${base64Auth}`;

    // 从请求中获取数据（如监控查询参数）
    const data = await context.request.json()

    // 转发请求到 UptimeRobot API v3（添加认证头）
    const response = await fetch('https://api.uptimerobot.com/v3/getMonitors', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': authHeader // 关键：添加 Basic Auth 头
      },
      body: JSON.stringify(data)
    })

    // 处理响应，添加 CORS 头
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    return newResponse

  } catch (error) {
    console.error('请求失败:', error)
    return new Response('请求失败', { status: 500 })
  }
}
