interface ParseResult {
  raw: string;
  data: any | null;
  error: Error | null;
}

export const parseMessageToJson = (raw: string): ParseResult => {
  try {
    const data = JSON.parse(raw);

    return {
      raw,
      data,
      error: null,
    };
  } catch (error) {
    return {
      raw,
      data: null,
      error: error as Error,
    };
  }
};

export default parseMessageToJson;
