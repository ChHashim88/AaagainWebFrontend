export const isOnSale = (product: any): boolean => {
  if (!product || product.salePrice === undefined || product.salePrice === null) return false;
  if (Number(product.salePrice) >= Number(product.price)) return false;

  const now = new Date();
  
  if (product.saleStartDate) {
    const startDate = new Date(product.saleStartDate);
    startDate.setHours(0, 0, 0, 0); // Start of local day
    if (now.getTime() < startDate.getTime()) return false;
  }
  
  if (product.saleEndDate) {
    const endDate = new Date(product.saleEndDate);
    endDate.setHours(23, 59, 59, 999); // End of local day
    if (now.getTime() > endDate.getTime()) return false;
  }
  
  return true;
};
