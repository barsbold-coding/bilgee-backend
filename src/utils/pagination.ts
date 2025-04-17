export interface IPagination {
  interval?: [number, number];
  page?: number;
  limit?: number;
}

export function paginate(query: IPagination) {
  if (query.interval) {
    return {
      offset: query.interval[0],
      limit: query.interval[1] - query.interval[0],
    };
  }
  return {
    offset: (query.page - 1) * query.limit || 0,
    limit: query.limit || 24,
  };
}
