const parseMessageToJson = (raw) => {
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
      error,
    };
  }
};
