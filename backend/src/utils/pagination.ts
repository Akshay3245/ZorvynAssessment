type PaginationInput = {
  page?: number;
  limit?: number;
};

export const getPagination = ({ page = 1, limit = 10 }: PaginationInput) => {
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip
  };
};
