// types.slang

// This module is part of the `reflection-parameter-blocks`
// example program.
//
// This module is split out from the files that define
// individual programs, so that we can share some type
// definitions between all of the programs and keep
// them focused on just defining the shader entry points.

struct Mesh
{
    float4x4 modelToWorld;
    float4x4 modelToWorld_inverseTranspose;
}

struct Material
{
    Texture2D albedoMap;
    Texture2D glossMap;
    Texture2D normalMap;
    SamplerState sampler;
}

interface ILight
{
}

struct DirectionalLight : ILight
{
    float3 dir;
    float3 intensity;
}

struct ShadowedLight<L : ILight> : ILight
{
    L light;
    Texture2D shadowMap;
    SamplerComparisonState shadowSampler;
    float4x4 worldToShadow;
}

struct EnvironmentMap
{
    TextureCube texture;
    SamplerState sampler;
}

struct Environment
{
    ShadowedLight<DirectionalLight> sunLight;
    EnvironmentMap envMap;
    RWStructuredBuffer<float4> output;
}

struct View
{
    float4x4 worldToView;
    float4x4 viewToProj;
}
