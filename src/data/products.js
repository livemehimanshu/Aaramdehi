export const ALL_PRODUCTS_DATA = [];

// Small helper to return a sample product when needed
export function sampleProduct() {
  return {
    _id: 'sample-1',
    name: 'Sample Product',
    thumbnail: 'https://via.placeholder.com/300',
    sellingPrice: 999,
    price: 1299,
    sizes: [{ label: 'Standard', price: 999 }],
  };
}
