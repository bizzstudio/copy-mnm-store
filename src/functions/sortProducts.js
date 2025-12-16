// Sort the products so that out-of-stock products are last
const sortProducts = (products) => {
    const sorted = products.sort((a, b) => {
        if (a.stock <= 0 && b.stock > 0) {
            return 1;
        } else if (a.stock > 0 && b.stock <= 0) {
            return -1;
        } else {
            return 0;
        }
    });

    const filtered = sorted.filter(prod => prod.stock > 0);
    return filtered;
};

export default sortProducts;