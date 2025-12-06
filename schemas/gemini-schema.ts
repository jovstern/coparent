/**
 * Gemini Schema Generation
 *
 * This file contains the Gemini-compatible JSON schema for agreement extraction.
 * The schema is manually maintained but should match the Zod schemas in agreement.schema.ts
 *
 * NOTE: The Zod schemas in agreement.schema.ts are the source of truth.
 * If you modify those schemas, please update this file accordingly.
 */

// Note: SchemaType enum values are defined inline to avoid importing from @google/generative-ai
// This allows the schema to be used in both frontend and functions without circular dependencies

const SchemaType = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
} as const;

// JSON Schema for structured extraction (Gemini format)
export const extractionSchemaGemini = {
  type: SchemaType.OBJECT,
  properties: {
    childSupport: {
      type: SchemaType.OBJECT,
      description: 'Financial child support obligations including amount, currency, payment frequency, CPI linkage, and start date',
      properties: {
        amount: {
          type: SchemaType.NUMBER,
          description: 'Monthly child support amount in the specified currency',
          nullable: true,
        },
        currency: {
          type: SchemaType.STRING,
          description: 'Currency code (ILS, USD, EUR, etc.)',
        },
        frequency: {
          type: SchemaType.STRING,
          enum: ['monthly', 'weekly', 'biweekly', 'annual'],
          description: 'Payment frequency',
        },
        isCPILinked: {
          type: SchemaType.BOOLEAN,
          description: 'Whether payments are linked to consumer price index',
        },
        startDate: {
          type: SchemaType.STRING,
          description: 'Start date in ISO format (YYYY-MM-DD)',
          nullable: true,
        },
        notes: {
          type: SchemaType.STRING,
          description: 'Additional notes about child support',
          nullable: true,
        },
      },
      required: ['currency', 'frequency', 'isCPILinked'],
    },
    expenseSplit: {
      type: SchemaType.OBJECT,
      description: 'How expenses are split between parents, with percentages for each parent',
      properties: {
        default: {
          type: SchemaType.OBJECT,
          description: 'Default expense split percentages',
          properties: {
            parent1: { type: SchemaType.NUMBER, description: 'Parent 1 percentage (0-100)' },
            parent2: { type: SchemaType.NUMBER, description: 'Parent 2 percentage (0-100)' },
          },
          required: ['parent1', 'parent2'],
        },
        medical: {
          type: SchemaType.OBJECT,
          description: 'Medical expense split percentages',
          properties: {
            parent1: { type: SchemaType.NUMBER },
            parent2: { type: SchemaType.NUMBER },
          },
          nullable: true,
        },
        education: {
          type: SchemaType.OBJECT,
          description: 'Education expense split percentages',
          properties: {
            parent1: { type: SchemaType.NUMBER },
            parent2: { type: SchemaType.NUMBER },
          },
          nullable: true,
        },
        extracurricular: {
          type: SchemaType.OBJECT,
          description: 'Extracurricular activity expense split percentages',
          properties: {
            parent1: { type: SchemaType.NUMBER },
            parent2: { type: SchemaType.NUMBER },
          },
          nullable: true,
        },
        notes: {
          type: SchemaType.STRING,
          description: 'Additional notes about expense splitting',
          nullable: true,
        },
      },
      required: ['default'],
    },
    custodySchedule: {
      type: SchemaType.OBJECT,
      description: 'Custody schedule including type, cycle duration, and which days each parent has custody',
      properties: {
        type: {
          type: SchemaType.STRING,
          enum: ['weekly', 'biweekly', 'custom'],
          description: 'Schedule pattern type',
        },
        cycleDuration: {
          type: SchemaType.NUMBER,
          description: 'Duration of schedule cycle in days',
        },
        parent1Days: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Days of week parent 1 has custody (e.g., ["Monday", "Tuesday"])',
        },
        parent2Days: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Days of week parent 2 has custody',
        },
        description: {
          type: SchemaType.STRING,
          description: 'Human-readable description of the custody schedule',
        },
        transitionDetails: {
          type: SchemaType.STRING,
          description: 'Details about custody transitions (time, location, etc.)',
          nullable: true,
        },
      },
      required: ['type', 'cycleDuration', 'parent1Days', 'parent2Days', 'description'],
    },
    holidays: {
      type: SchemaType.ARRAY,
      description: 'Holiday custody arrangements',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: 'Holiday name',
          },
          year: {
            type: SchemaType.NUMBER,
            description: 'Specific year if mentioned',
            nullable: true,
          },
          assignedTo: {
            type: SchemaType.STRING,
            enum: ['parent1', 'parent2', 'alternating'],
            description: 'Which parent has custody for this holiday',
          },
          notes: {
            type: SchemaType.STRING,
            description: 'Additional details about holiday arrangement',
            nullable: true,
          },
        },
        required: ['name', 'assignedTo'],
      },
    },
    children: {
      type: SchemaType.ARRAY,
      description: 'Information about children covered by this agreement',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          firstName: {
            type: SchemaType.STRING,
            description: 'Child first name',
          },
          lastName: {
            type: SchemaType.STRING,
            description: 'Child last name',
            nullable: true,
          },
          dateOfBirth: {
            type: SchemaType.STRING,
            description: 'Date of birth in ISO format (YYYY-MM-DD)',
            nullable: true,
          },
          age: {
            type: SchemaType.NUMBER,
            description: 'Current age',
            nullable: true,
          },
        },
        required: ['firstName'],
      },
    },
    specialProvisions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Special provisions, restrictions, or requirements mentioned in the agreement',
    },
    extractionMetadata: {
      type: SchemaType.OBJECT,
      description: 'Metadata about the extraction quality and completeness',
      properties: {
        confidenceScore: {
          type: SchemaType.NUMBER,
          description: 'Overall confidence score 0-100 based on clarity of extracted information',
        },
        warnings: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of warnings about ambiguous or conflicting information',
        },
        fieldsExtracted: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of field names that were successfully extracted',
        },
        fieldsNotFound: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of field names that were not found in the document',
        },
      },
      required: ['confidenceScore', 'warnings', 'fieldsExtracted', 'fieldsNotFound'],
    },
  },
  required: ['childSupport', 'expenseSplit', 'custodySchedule', 'holidays', 'children', 'specialProvisions', 'extractionMetadata'],
};
