# AI Agents

This directory contains AI agent configurations for the Coparent application. Each agent is specialized for a specific task and includes:

- **System prompts**: Instructions that define the agent's role and behavior
- **User prompts**: Task-specific instructions for each invocation
- **Configuration**: Model settings, temperature, and response formats

## Available Agents

### Agreement Analyzer (`agreement-analyzer.ts`)

Specialized in analyzing divorce agreements and custody arrangements. Extracts structured information from legal documents.

**Model**: `gemini-2.5-flash`
**Temperature**: `0.0` (deterministic extraction)
**Output**: JSON conforming to `agreementDataSchema`

**Usage**:
```typescript
import {
  agreementAnalyzerSystemPrompt,
  agreementAnalyzerUserPrompt,
  agreementAnalyzerConfig
} from '../agents';

const model = genAI.getGenerativeModel({
  model: agreementAnalyzerConfig.model,
  generationConfig: {
    responseSchema: extractionSchemaGemini,
    responseMimeType: agreementAnalyzerConfig.responseMimeType,
    temperature: agreementAnalyzerConfig.temperature,
  },
});
```

## Adding New Agents

1. Create a new file: `agents/your-agent-name.ts`
2. Export system prompt, user prompt, and config
3. Add exports to `agents/index.ts`
4. Document in this README

## Best Practices

- Keep prompts focused and task-specific
- Use deterministic temperature (0.0-0.2) for structured extraction
- Use higher temperature (0.7-1.0) for creative tasks
- Always specify response schema for JSON outputs
- Test prompts with edge cases before deployment
