import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { apiKey, endpointUrl } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "OpenAI API key is required." }, { status: 401 })
    }

    if (!endpointUrl) {
      return Response.json({ error: "Endpoint URL is required." }, { status: 400 })
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
      const errorData = await response.json().catch(() => ({}))
      return Response.json(
        {
          error: errorData.error?.message || `Failed to connect to endpoint: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    // If we get here, the connection was successful
    return Response.json({ success: true, message: "Connection successful" })
  } catch (error: any) {
    console.error("Error testing endpoint:", error)
    return Response.json(
      {
        error: error.message || "Failed to test endpoint connection",
      },
      { status: 500 },
    )
  }
}
