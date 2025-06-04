import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, endpointUrl } = await request.json()

    if (!apiKey || !endpointUrl) {
      return NextResponse.json({ error: "API key and endpoint URL are required" }, { status: 400 })
    }

    // Normalize the endpoint URL
    const normalizedUrl = endpointUrl.endsWith("/") ? endpointUrl.slice(0, -1) : endpointUrl

    // Test the connection by making a simple models list request
    const testUrl = `${normalizedUrl}/v1/models`

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}`

      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorData.message || errorMessage
      } catch {
        // If parsing fails, use the status text or raw text
        errorMessage = response.statusText || errorText || errorMessage
      }

      return NextResponse.json({ error: `Connection failed: ${errorMessage}` }, { status: response.status })
    }

    const data = await response.json()

    // Check if the response has the expected structure
    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json({ error: "Invalid response format from endpoint" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      models: data.data.length,
    })
  } catch (error: any) {
    console.error("Endpoint test error:", error)
    return NextResponse.json({ error: error.message || "Failed to test endpoint connection" }, { status: 500 })
  }
}
