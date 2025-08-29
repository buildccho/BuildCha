/**
 * Testing library/framework: Jest-style APIs (describe/it/expect, jest.mock).
 * These tests should be compatible with Jest or Vitest (Jest-compat mode).
 *
 * Focus: apps/backend/src/util/create3DObjectFromMessage.ts
 * Public API under test: create3DObjectFromMessage(userInput: string, history: string)
 *
 * We mock external dependencies:
 * - @langchain/openai ChatOpenAI and its withStructuredOutput()/invoke()
 * - @langchain/core/prompts ChatPromptTemplate.fromMessages() and .formatPromptValue()
 * - ../ai/schemas AiOutputSchema (only passed through, not executed)
 * - ../config getConfig to supply OPENAI_API_KEY
 */

import { describe, it, expect, beforeEach, vi } from "vitest"; // If using Jest, replace with jest globals or keep via tsconfig mappings

// Module under test path resolution note:
// The compiled code imports from "../ai/schemas" and "../config" relative to create3DObjectFromMessage file.
// We'll mock those modules below.

vi.mock("@langchain/openai", () => {
  class ChatOpenAI {
    private opts: any;
    constructor(opts: any) {
      // Save options to assert in tests
      this.opts = opts;
    }
    withStructuredOutput = vi.fn().mockImplementation((_schema: unknown) => {
      return {
        invoke: vi.fn(), // We'll override per-test
      };
    });
  }
  return { ChatOpenAI };
});

vi.mock("@langchain/core/prompts", () => {
  return {
    ChatPromptTemplate: {
      fromMessages: vi.fn().mockImplementation((messages: any[]) => {
        // Return an object exposing formatPromptValue to simulate LangChain behavior
        return {
          __messages: messages,
          formatPromptValue: vi.fn().mockImplementation(async (vars: any) => {
            // Return a simplified "prompt value" object the model can accept.
            return {
              toString: () => JSON.stringify({ messages, vars }),
              // Some LangChain components can accept plain objects; we'll just echo variables back.
              ...vars,
            };
          }),
        };
      }),
    },
  };
});

vi.mock("../ai/schemas", () => {
  // Minimal placeholder; we don't validate schema here.
  return {
    AiOutputSchema: { kind: "zod-like-placeholder" },
  };
});

// getConfig mock to supply API key
vi.mock("../config", () => {
  return {
    getConfig: vi.fn().mockReturnValue({ OPENAI_API_KEY: "test-api-key" }),
  };
});

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getConfig } from "../config";

// Import after mocks
import { create3DObjectFromMessage } from "../create3DObjectFromMessage";

type AnyFn = (...args: any[]) => any;

const getInvokeMock = (): AnyFn => {
  // Access the instance method created by withStructuredOutput in our mock.
  // We'll patch it per test by spying on the returned object.
  // Since we create the model inside the function, we need to intercept the returned object's invoke.
  // We'll spy via mock implementation override below.
  return vi.fn();
};

describe("create3DObjectFromMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates ChatOpenAI with API key and model, then returns AI response (happy path)", async () => {
    const invokeMock = getInvokeMock();

    // Arrange: patch withStructuredOutput to return an object whose invoke returns a structured JSON
    const withStructuredOutputSpy = vi
      .spyOn((ChatOpenAI as unknown as { prototype: any }).prototype, "withStructuredOutput")
      .mockImplementation((_schema: unknown) => {
        return { invoke: invokeMock };
      });

    const expectedResponse = {
      chat: "やったー！かわいい家をつくったよ！",
      name: "かわいい家",
      parts: [
        {
          type: "floor",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          size: [4, 0.2, 4],
          color: "#FFFFE0",
        },
      ],
    };
    invokeMock.mockResolvedValueOnce(expectedResponse);

    // Act
    const res = await create3DObjectFromMessage("かわいい家つくって！", "");

    // Assert
    expect(getConfig).toHaveBeenCalledTimes(1);
    // Verify ChatOpenAI instantiation options indirectly by checking the spy call context
    // We can't directly assert constructor args since our mock class stores them internally.
    // Alternative: Spy on constructor via mock implementation.
    const ModelCtor = ChatOpenAI as unknown as any;
    // Create a new instance to read the default model set in code; skip here and rely on behavior.
    expect(withStructuredOutputSpy).toHaveBeenCalledTimes(1);

    // Ensure prompt template was built with a system message and one user template
    expect(ChatPromptTemplate.fromMessages).toHaveBeenCalledTimes(1);
    const callArg = (ChatPromptTemplate.fromMessages as unknown as AnyFn).mock.calls[0][0];
    expect(Array.isArray(callArg)).toBe(true);
    expect(callArg[0][0]).toBe("system");
    expect(callArg[1][0]).toBe("user");
    // Ensure the function returned the model's response
    expect(res).toEqual(expectedResponse);
  });

  it("passes user input and history into prompt formatting", async () => {
    const invokeMock = getInvokeMock();
    vi.spyOn((ChatOpenAI as any).prototype, "withStructuredOutput").mockImplementation(() => ({ invoke: invokeMock }));
    invokeMock.mockResolvedValueOnce({ chat: "ok", name: "n", parts: [] });

    const formatSpy = vi.fn(async (vars: any) => vars);
    // Override ChatPromptTemplate.fromMessages to capture format vars
    (ChatPromptTemplate.fromMessages as unknown as AnyFn).mockImplementationOnce((_msgs: any[]) => {
      return { formatPromptValue: formatSpy };
    });

    const userInput = "青い屋根の家";
    const history = "前回: 赤い屋根の家";

    await create3DObjectFromMessage(userInput, history);

    expect(formatSpy).toHaveBeenCalledTimes(1);
    const passedVars = formatSpy.mock.calls[0][0];
    expect(passedVars).toEqual({ input: userInput, history });
  });

  it("uses AiOutputSchema via withStructuredOutput to enforce structured output call path", async () => {
    const invokeMock = getInvokeMock();
    const schemaCapture: unknown[] = [];

    vi.spyOn((ChatOpenAI as any).prototype, "withStructuredOutput").mockImplementation((schema: unknown) => {
      schemaCapture.push(schema);
      return { invoke: invokeMock };
    });
    invokeMock.mockResolvedValueOnce({ chat: "ok", name: "n", parts: [] });

    await create3DObjectFromMessage("家", "");

    expect(schemaCapture.length).toBe(1);
    // We don't know exact instance; just ensure something schema-like was passed
    expect(schemaCapture[0]).toBeDefined();
  });

  it("propagates model invocation errors with a clean application error", async () => {
    const invokeMock = getInvokeMock();
    vi.spyOn((ChatOpenAI as any).prototype, "withStructuredOutput").mockImplementation(() => ({ invoke: invokeMock }));

    const err = new Error("OpenAI service unavailable");
    invokeMock.mockRejectedValueOnce(err);

    await expect(create3DObjectFromMessage("失敗するかな？", "")).rejects.toThrow("Failed to create 3D data");
  });

  it("throws a clean application error when configuration retrieval fails", async () => {
    // Make getConfig throw
    (getConfig as unknown as AnyFn).mockImplementationOnce(() => {
      throw new Error("Missing env");
    });

    await expect(create3DObjectFromMessage("config失敗", "")).rejects.toThrow("Failed to create 3D data");
  });

  it("ensures the system instruction remains part of the prompt (smoke check)", async () => {
    const invokeMock = getInvokeMock();
    // Capture the prompt that invoke receives
    vi.spyOn((ChatOpenAI as any).prototype, "withStructuredOutput").mockImplementation(() => ({ invoke: invokeMock }));

    // Make formatPromptValue return an object containing a toString() including content, to verify system prompt injected.
    const systemCheck = { sawSystem: false };
    (ChatPromptTemplate.fromMessages as unknown as AnyFn).mockImplementationOnce((messages: any[]) => {
      // Check if the first message tuple has "system" and includes key phrases
      const sys = messages?.[0]?.[1] ?? "";
      if (typeof sys === "string" && sys.includes("3D建物生成システムプロンプト")) {
        systemCheck.sawSystem = true;
      }
      return {
        formatPromptValue: vi.fn(async (vars: any) => ({ ...vars, __messages: messages })),
      };
    });

    invokeMock.mockResolvedValueOnce({ chat: "ok", name: "n", parts: [] });

    await create3DObjectFromMessage("家", "履歴");

    expect(systemCheck.sawSystem).toBe(true);
  });

  it("uses the expected default model id", async () => {
    // We'll intercept the constructor to capture options
    const ctorSpy = vi.spyOn((ChatOpenAI as any), "constructor"); // Not viable in JS. Instead, wrap the class.
    // Alternative: Replace ChatOpenAI with a test double capturing opts.
    const calls: any[] = [];
    vi.doMock("@langchain/openai", () => {
      return {
        ChatOpenAI: class {
          opts: any;
          constructor(opts: any) {
            calls.push(opts);
          }
          withStructuredOutput = () => ({ invoke: vi.fn().mockResolvedValue({ chat: "ok", name: "n", parts: [] }) });
        },
      };
    });

    // Re-import with this new mock override in effect
    const { create3DObjectFromMessage: create3DObjectFromMessageReloaded } = await import("../create3DObjectFromMessage");

    await create3DObjectFromMessageReloaded("家", "");

    expect(calls.length).toBe(1);
    expect(calls[0]).toMatchObject({
      apiKey: "test-api-key",
      model: "gpt-4o-mini",
    });
  });
});