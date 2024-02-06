import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate'
import { ReplicateStream, StreamingTextResponse } from 'ai'
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: NextRequest, res: NextResponse) {
    const body = await req.json()
    let response = await runLlama({
        ...body,
        model: 'meta/llama-2-13b-chat',
    })

    // Convert the response into a friendly text-stream
    const stream = await ReplicateStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}

async function runLlama({
    model,
    prompt,
    systemPrompt,
    maxTokens,
    temperature,
    topP,
}: {
    model: string
    prompt: string
    systemPrompt?: string
    maxTokens: number
    temperature: number
    topP: number
}) {
    return await replicate.predictions.create({
        model,
        stream: true,
        input: {
            prompt: `${prompt}`,
            prompt_template: "{prompt}",
            max_new_tokens: maxTokens,
            temperature: temperature,
            repetition_penalty: 1,
            top_p: topP,
        },
    })
}