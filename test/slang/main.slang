// main.slang

[shader("vertex")]
float4 vertexMain(float2 position : POSITION) : SV_Position
{
    return float4(position, 0.5, 1.0);
}

[shader("fragment")]
float4 fragmentMain(float4 sv_position : SV_Position) : SV_Target
{
    float2 fragCoord = sv_position.xy;
    float2 resolution = float2(640, 360);
    float screenScale = length(resolution);
    return float4(fragCoord / screenScale, 0, 1);
}
