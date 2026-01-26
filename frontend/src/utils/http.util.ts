export const formatQueryParams = (params: Record<string, string>) => {
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '')
    );
  };