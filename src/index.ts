import * as provider from './provider'
import * as gemini from './gemini'
import * as openai from './openai'

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            return await handle(request)
        } catch (error) {
            console.error(error)
            return new Response('Internal server error', { status: 500 })
        }
    }
} satisfies ExportedHandler<Env>

async function handle(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(part => part !== '')
    if (pathParts.length < 3) {
        return new Response('Invalid path format. Expected: /{type}/{provider_url}/v1/messages', { status: 400 })
    }
    const lastTwoParts = pathParts.slice(-2)
    if (lastTwoParts[0] !== 'v1' || lastTwoParts[1] !== 'messages') {
        return new Response('Path must end with /v1/messages', { status: 404 })
    }

    const typeParam = pathParts[0]
    const providerUrlParts = pathParts.slice(1, -2)

    // [..., 'https:', ...] ==> [..., 'https:/', ...]
    if (pathParts[1].startsWith('http')) {
        pathParts[1] = pathParts[1] + '/'
    }

    const baseUrl = providerUrlParts.join('/')
    if (!typeParam || !baseUrl) {
        return new Response('Missing type or provider_url in path', { status: 400 })
    }

    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
        return new Response('Missing x-api-key header', { status: 401 })
    }

    let provider: provider.Provider
    switch (typeParam) {
        case 'gemini':
            provider = new gemini.impl()
            break
        case 'openai':
            provider = new openai.impl()
            break
        default:
            return new Response('Unsupported type', { status: 400 })
    }

    const providerRequest = await provider.convertToProviderRequest(request.clone(), baseUrl, apiKey)
    const providerResponse = await fetch(providerRequest)
    return await provider.convertToClaudeResponse(providerResponse)
}
