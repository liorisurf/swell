// AI utility functions for calling the Anthropic Claude API
// All AI calls go through our API routes for security

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: (fullText: string) => void
  onError: (error: Error) => void
}

export async function streamAIResponse(
  endpoint: string,
  body: Record<string, unknown>,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            callbacks.onComplete(fullText)
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              fullText += parsed.text
              callbacks.onToken(parsed.text)
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }

    callbacks.onComplete(fullText)
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

export async function callAI(
  endpoint: string,
  body: Record<string, unknown>
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.text
}
