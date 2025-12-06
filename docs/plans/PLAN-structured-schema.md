# Plan: Implement Structured Response Schema for Gemini API

**Note**: This is a sub-plan for the larger project plan.

## Phase 1: Convert Interface to JSON Schema
- Convert `AgreementData` TypeScript interface to JSON Schema format
- Use proper JSON Schema types and constraints
- Ensure all nested objects and arrays are properly defined
- Add descriptions for fields to improve extraction accuracy

## Phase 2: Update Gemini Configuration
- Add `responseSchema` parameter to `generationConfig`
- Set temperature to 0.0 for deterministic extraction
- Remove `responseMimeType` (handled by schema)

## Phase 3: Streamline Prompts
- Move all extraction field descriptions from user prompt to schema
- Remove numbered list from user prompt
- Keep only high-level instructions in prompts
- Ensure system prompt contains all extraction rules

## Phase 4: Test and Validate
- Ensure schema validates correctly
- Test with sample document
- Verify response matches schema structure

## Unresolved Questions
- Should we use Files API instead of inline data for large PDFs?
- What max file size for Files API vs inline?
